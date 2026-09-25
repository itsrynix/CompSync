// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use compsync_core::{
    AepTarget, Author, FileChangeState, IndexDb, Manifest, ManifestFileEntry, ProjectScanner,
};
use compsync_network::{DiscoveryManager, PeerInfo, SyncEngine, DEFAULT_TCP_PORT};
use compsync_watcher::{check_file_lock, LockStatus};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone)]
pub struct LockInfo {
    pub is_locked: bool,
    pub process_name: Option<String>,
    pub process_id: Option<u32>,
    pub is_after_effects: bool,
}

#[derive(Serialize, Deserialize)]
pub struct RepoStatusDto {
    pub is_initialized: bool,
    pub project_id: Option<String>,
    pub project_name: Option<String>,
    pub aep_files: Vec<AepFileStatus>,
    pub indexed_files_count: usize,
}

#[derive(Serialize, Deserialize)]
pub struct AepFileStatus {
    pub file_name: String,
    pub canonical_path: String,
    pub lock: LockInfo,
}

#[derive(Serialize, Deserialize)]
pub struct ScannedFileDto {
    pub path: String,
    pub size_mb: f64,
    pub state: String,
    pub hash_short: String,
}

#[derive(Serialize, Deserialize)]
pub struct ScanResultDto {
    pub files: Vec<ScannedFileDto>,
    pub total_files: usize,
    pub total_mb: f64,
    pub cached_files: usize,
    pub hashed_files: usize,
    pub duration_ms: u128,
    pub throughput_gbps: f64,
}

#[derive(Serialize, Deserialize)]
pub struct SnapshotSummaryDto {
    pub snapshot_id: String,
    pub message: String,
    pub created_at: String,
    pub author_name: String,
    pub total_files: usize,
    pub total_mb: f64,
}

#[derive(Serialize, Deserialize)]
struct RepoConfig {
    project_id: Uuid,
    project_name: String,
    created_at: String,
}

lazy_static::lazy_static! {
    static ref ACTIVE_DISCOVERY: Arc<RwLock<Option<DiscoveryManager>>> = Arc::new(RwLock::new(None));
}

#[tauri::command]
async fn get_project_status(path: String) -> Result<RepoStatusDto, String> {
    let root = PathBuf::from(&path);
    let compsync_dir = root.join(".compsync");

    if !compsync_dir.exists() {
        return Ok(RepoStatusDto {
            is_initialized: false,
            project_id: None,
            project_name: None,
            aep_files: Vec::new(),
            indexed_files_count: 0,
        });
    }

    let config_bytes = fs::read(compsync_dir.join("config.json"))
        .map_err(|e| format!("Failed to read config: {}", e))?;
    let config: RepoConfig = serde_json::from_slice(&config_bytes)
        .map_err(|e| format!("Invalid config: {}", e))?;

    let db = IndexDb::open(&compsync_dir.join("index.db"))
        .map_err(|e| format!("DB error: {}", e))?;
    let cached = db.get_all().map_err(|e| format!("DB error: {}", e))?;

    let mut aep_files = Vec::new();
    let mut dirs = vec![root.clone()];
    while let Some(dir) = dirs.pop() {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let p = entry.path();
                if p.is_dir() {
                    if entry.file_name() != ".compsync" {
                        dirs.push(p);
                    }
                } else if p.is_file() {
                    if let Some(ext) = p.extension() {
                        if ext == "aep" {
                            let lock_res = check_file_lock(&p);
                            let lock = match lock_res {
                                LockStatus::Free => LockInfo {
                                    is_locked: false,
                                    process_name: None,
                                    process_id: None,
                                    is_after_effects: false,
                                },
                                LockStatus::Locked {
                                    process_id,
                                    process_name,
                                    is_after_effects,
                                } => LockInfo {
                                    is_locked: true,
                                    process_name,
                                    process_id,
                                    is_after_effects,
                                },
                            };

                            let canonical = p.strip_prefix(&root).unwrap_or(&p).to_string_lossy().to_string();
                            aep_files.push(AepFileStatus {
                                file_name: p.file_name().unwrap_or_default().to_string_lossy().to_string(),
                                canonical_path: canonical,
                                lock,
                            });
                        }
                    }
                }
            }
        }
    }

    let mut disc_lock = ACTIVE_DISCOVERY.write().await;
    if disc_lock.is_none() {
        let disc = DiscoveryManager::new(whoami_device_id(), config.project_id);
        disc.start_listener();
        let is_any_locked = aep_files.iter().any(|f| f.lock.is_locked);
        let locked_flag = Arc::new(RwLock::new(is_any_locked));
        disc.start_announcer(whoami_device_name(), DEFAULT_TCP_PORT, locked_flag);
        *disc_lock = Some(disc);
    }

    Ok(RepoStatusDto {
        is_initialized: true,
        project_id: Some(config.project_id.to_string()),
        project_name: Some(config.project_name),
        aep_files,
        indexed_files_count: cached.len(),
    })
}

#[tauri::command]
async fn init_project(path: String) -> Result<String, String> {
    let root = PathBuf::from(&path);
    let compsync_dir = root.join(".compsync");

    fs::create_dir_all(&compsync_dir).map_err(|e| e.to_string())?;
    fs::create_dir_all(compsync_dir.join("objects").join("snapshots")).map_err(|e| e.to_string())?;
    fs::create_dir_all(compsync_dir.join("staging")).map_err(|e| e.to_string())?;
    fs::create_dir_all(compsync_dir.join("locks")).map_err(|e| e.to_string())?;

    let project_name = root
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| "AE_Project".to_string());

    let config = RepoConfig {
        project_id: Uuid::new_v4(),
        project_name,
        created_at: chrono::Utc::now().to_rfc3339(),
    };
    fs::write(
        compsync_dir.join("config.json"),
        serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?,
    ).map_err(|e| e.to_string())?;

    let _db = IndexDb::open(&compsync_dir.join("index.db")).map_err(|e| e.to_string())?;

    let ignore_file = root.join(".compsyncignore");
    if !ignore_file.exists() {
        let _ = fs::write(
            &ignore_file,
            "# CompSync Default Ignore Patterns for Adobe After Effects\n\
             *After Effects Disk Cache*\n\
             Adobe After Effects Auto-Save/\n\
             *.adobecache\n\
             *.aecache\n\
             *.cache\n\
             *Adobe Premiere Pro Audio Previews*\n\
             *Adobe Premiere Pro Video Previews*\n\
             *.pek\n\
             *.cfa\n\
             Thumbs.db\n\
             ehthumbs.db\n\
             Desktop.ini\n\
             .DS_Store\n\
             ._*\n\
             *.part\n\
             *.tmp\n",
        );
    }

    Ok(config.project_id.to_string())
}

#[tauri::command]
async fn scan_project(path: String) -> Result<ScanResultDto, String> {
    let root = PathBuf::from(&path);
    let compsync_dir = root.join(".compsync");

    let db = IndexDb::open(&compsync_dir.join("index.db"))
        .map_err(|e| e.to_string())?;
    let scanner = ProjectScanner::new(&root, &db);

    let (scanned_files, summary) = scanner.scan().map_err(|e| e.to_string())?;

    let files = scanned_files
        .into_iter()
        .map(|f| ScannedFileDto {
            path: f.canonical_path,
            size_mb: (f.size_bytes as f64) / (1024.0 * 1024.0),
            state: match f.state {
                FileChangeState::Added => "Added".into(),
                FileChangeState::Modified => "Modified".into(),
                FileChangeState::Unchanged => "Cached".into(),
            },
            hash_short: if f.blake3_hash.len() >= 8 {
                f.blake3_hash[..8].to_string()
            } else {
                f.blake3_hash
            },
        })
        .collect();

    let throughput_gbps = if summary.hashed_bytes > 0 && summary.duration_ms > 0 {
        (summary.hashed_bytes as f64 / (summary.duration_ms as f64 / 1000.0))
            / (1024.0 * 1024.0 * 1024.0)
    } else {
        0.0
    };

    Ok(ScanResultDto {
        files,
        total_files: summary.total_files,
        total_mb: (summary.total_bytes as f64) / (1024.0 * 1024.0),
        cached_files: summary.cached_files,
        hashed_files: summary.hashed_files,
        duration_ms: summary.duration_ms,
        throughput_gbps,
    })
}

#[tauri::command]
async fn create_snapshot(path: String, message: String) -> Result<String, String> {
    let root = PathBuf::from(&path);
    let compsync_dir = root.join(".compsync");

    let config_bytes = fs::read(compsync_dir.join("config.json")).map_err(|e| e.to_string())?;
    let config: RepoConfig = serde_json::from_slice(&config_bytes).map_err(|e| e.to_string())?;

    let db = IndexDb::open(&compsync_dir.join("index.db")).map_err(|e| e.to_string())?;
    let scanner = ProjectScanner::new(&root, &db);

    let (scanned_files, _) = scanner.scan().map_err(|e| e.to_string())?;
    if scanned_files.is_empty() {
        return Err("No files found to snapshot.".into());
    }

    let mut manifest_entries = Vec::new();
    let mut detected_aep = None;

    for file in scanned_files {
        if file.canonical_path.ends_with(".aep") && detected_aep.is_none() {
            detected_aep = Some(AepTarget {
                canonical_path: file.canonical_path.clone(),
                blake3_hash: file.blake3_hash.clone(),
                size_bytes: file.size_bytes,
                ae_version_hint: None,
            });
        }

        manifest_entries.push(ManifestFileEntry {
            path: file.canonical_path,
            size_bytes: file.size_bytes,
            mtime_epoch_ms: file.mtime_epoch_ms,
            blake3_hash: file.blake3_hash,
            chunk_strategy: if file.chunks.is_some() {
                "chunked".to_string()
            } else {
                "monolithic".to_string()
            },
            chunks: file.chunks,
        });
    }

    let author = Author {
        device_id: whoami_device_id(),
        device_name: whoami_device_name(),
        os: std::env::consts::OS.to_string(),
        user_alias: whoami_user(),
    };

    let manifest = Manifest::new(
        config.project_id,
        None,
        author,
        message,
        detected_aep,
        manifest_entries,
    );

    manifest.save_to_objects(&compsync_dir).map_err(|e| e.to_string())?;

    Ok(manifest.snapshot_id)
}

#[tauri::command]
async fn get_snapshots(path: String) -> Result<Vec<SnapshotSummaryDto>, String> {
    let root = PathBuf::from(&path);
    let snapshots_dir = root.join(".compsync").join("objects").join("snapshots");

    if !snapshots_dir.exists() {
        return Ok(Vec::new());
    }

    let mut list = Vec::new();
    if let Ok(entries) = fs::read_dir(snapshots_dir) {
        for entry in entries.flatten() {
            let p = entry.path();
            if p.extension().map_or(false, |ext| ext == "json") {
                if let Ok(manifest) = Manifest::load_from_file(&p) {
                    list.push(SnapshotSummaryDto {
                        snapshot_id: manifest.snapshot_id,
                        message: manifest.message,
                        created_at: manifest.created_at.to_rfc3339(),
                        author_name: manifest.author.device_name,
                        total_files: manifest.stats.total_files,
                        total_mb: (manifest.stats.total_bytes as f64) / (1024.0 * 1024.0),
                    });
                }
            }
        }
    }

    list.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(list)
}

#[tauri::command]
async fn get_lan_peers() -> Result<Vec<PeerInfo>, String> {
    let lock = ACTIVE_DISCOVERY.read().await;
    if let Some(ref disc) = *lock {
        Ok(disc.get_peers().await)
    } else {
        Ok(Vec::new())
    }
}

#[tauri::command]
async fn pull_from_peer(path: String, peer_ip: String, peer_port: u16) -> Result<String, String> {
    let root = PathBuf::from(&path);
    let compsync_dir = root.join(".compsync");

    let config_bytes = fs::read(compsync_dir.join("config.json")).map_err(|e| e.to_string())?;
    let config: RepoConfig = serde_json::from_slice(&config_bytes).map_err(|e| e.to_string())?;

    let engine = SyncEngine::new(
        root,
        whoami_device_id(),
        whoami_device_name(),
        config.project_id,
    );

    let res = engine
        .pull_from_peer(&peer_ip, peer_port, |_progress| {})
        .await
        .map_err(|e| e.to_string())?;

    Ok(res)
}

fn whoami_device_id() -> String {
    format!(
        "{}-{}",
        whoami_device_name().to_lowercase().replace(' ', "-"),
        &Uuid::new_v4().to_string()[..8]
    )
}

fn whoami_device_name() -> String {
    std::env::var("COMPUTERNAME").unwrap_or_else(|_| "Desktop".to_string())
}

fn whoami_user() -> String {
    std::env::var("USERNAME").unwrap_or_else(|_| "User".to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_project_status,
            init_project,
            scan_project,
            create_snapshot,
            get_snapshots,
            get_lan_peers,
            pull_from_peer,
        ])
        .run(tauri::generate_context!())
        .expect("error while running compsync desktop application");
}
