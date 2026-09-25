use clap::{Parser, Subcommand};
use colored::*;
use compsync_core::{
    AepTarget, Author, IndexDb, Manifest, ManifestFileEntry, ProjectScanner,
};
use compsync_watcher::{check_file_lock, LockStatus};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Parser)]
#[command(name = "compsync")]
#[command(about = "CompSync - High Performance Local-First Version Control & Sync for After Effects", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,

    /// Project root directory (default: current working directory)
    #[arg(short, long, global = true)]
    path: Option<PathBuf>,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize a new CompSync repository in the current directory
    Init,

    /// High-speed scan of project tree using BLAKE3 SIMD and SQLite index cache
    Scan,

    /// Create a new snapshot (commit) with a message
    Snapshot {
        /// Snapshot description or version notes
        #[arg(short, long)]
        message: String,
    },

    /// Check if an After Effects (.aep) file is currently locked by a process
    LockCheck {
        /// Relative or absolute path to the .aep file
        file: PathBuf,
    },

    /// Display current status of working tree and indexed files
    Status,
}

#[derive(Serialize, Deserialize)]
struct RepoConfig {
    project_id: Uuid,
    project_name: String,
    created_at: String,
}

fn get_project_root(cli_path: Option<PathBuf>) -> PathBuf {
    cli_path.unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")))
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();
    let root = get_project_root(cli.path);
    let compsync_dir = root.join(".compsync");

    match cli.command {
        Commands::Init => {
            println!(
                "{} Initializing CompSync repository in {}",
                "->".cyan().bold(),
                root.display().to_string().bold()
            );

            if compsync_dir.exists() {
                println!(
                    "{} CompSync repository already exists at {}",
                    "!".yellow().bold(),
                    compsync_dir.display()
                );
                return Ok(());
            }

            fs::create_dir_all(&compsync_dir)?;
            fs::create_dir_all(compsync_dir.join("objects").join("snapshots"))?;
            fs::create_dir_all(compsync_dir.join("staging"))?;
            fs::create_dir_all(compsync_dir.join("locks"))?;

            // Generate initial config
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
                serde_json::to_string_pretty(&config)?,
            )?;

            // Initialize SQLite DB
            let _db = IndexDb::open(&compsync_dir.join("index.db"))?;

            // Generate default .compsyncignore if not present
            let ignore_file = root.join(".compsyncignore");
            if !ignore_file.exists() {
                fs::write(
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
                )?;
                println!(
                    "{} Created default .compsyncignore",
                    "✓".green().bold()
                );
            }

            println!(
                "{} Repository initialized successfully! (Project ID: {})",
                "✓".green().bold(),
                config.project_id
            );
        }

        Commands::Scan => {
            if !compsync_dir.exists() {
                eprintln!(
                    "{} Not a CompSync repository. Run `compsync init` first.",
                    "Error:".red().bold()
                );
                return Ok(());
            }

            let db = IndexDb::open(&compsync_dir.join("index.db"))?;
            let scanner = ProjectScanner::new(&root, &db);

            println!("{} Scanning project tree...", "->".cyan().bold());
            let (files, summary) = scanner.scan()?;

            for file in &files {
                let status_badge = match file.state {
                    compsync_core::FileChangeState::Added => "[+ ADDED]".green().bold(),
                    compsync_core::FileChangeState::Modified => "[~ MODIFIED]".yellow().bold(),
                    compsync_core::FileChangeState::Unchanged => "[  CACHED]".dimmed(),
                };
                let size_mb = (file.size_bytes as f64) / (1024.0 * 1024.0);
                println!(
                    "  {} {:<45} {:>8.2} MB  ({}..)",
                    status_badge,
                    file.canonical_path,
                    size_mb,
                    &file.blake3_hash[..8]
                );
            }

            println!("\n{}", "--- Scan Performance Summary ---".bold());
            println!("  Total files      : {}", summary.total_files);
            println!(
                "  Total volume     : {:.2} MB",
                summary.total_bytes as f64 / (1024.0 * 1024.0)
            );
            println!("  Cache hits       : {} files", summary.cached_files);
            println!("  Freshly hashed   : {} files", summary.hashed_files);
            println!(
                "  Hashed data      : {:.2} MB",
                summary.hashed_bytes as f64 / (1024.0 * 1024.0)
            );
            println!("  Duration         : {} ms", summary.duration_ms);

            if summary.hashed_bytes > 0 && summary.duration_ms > 0 {
                let throughput_gbps = (summary.hashed_bytes as f64
                    / (summary.duration_ms as f64 / 1000.0))
                    / (1024.0 * 1024.0 * 1024.0);
                println!(
                    "  Hashing Throughput: {:.2} GB/s ({})",
                    throughput_gbps,
                    "SIMD BLAKE3 Rayon".magenta()
                );
            }
        }

        Commands::Snapshot { message } => {
            if !compsync_dir.exists() {
                eprintln!(
                    "{} Not a CompSync repository. Run `compsync init` first.",
                    "Error:".red().bold()
                );
                return Ok(());
            }

            let config_bytes = fs::read(compsync_dir.join("config.json"))?;
            let config: RepoConfig = serde_json::from_slice(&config_bytes)?;

            let db = IndexDb::open(&compsync_dir.join("index.db"))?;
            let scanner = ProjectScanner::new(&root, &db);

            println!("{} Scanning working tree for snapshot...", "->".cyan());
            let (scanned_files, _) = scanner.scan()?;

            if scanned_files.is_empty() {
                println!(
                    "{} No files found to snapshot.",
                    "Warning:".yellow().bold()
                );
                return Ok(());
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
                None, // Parent snapshot ID (MVP single/linear branch)
                author,
                message.clone(),
                detected_aep,
                manifest_entries,
            );

            manifest.save_to_objects(&compsync_dir)?;

            println!(
                "{} Created snapshot {} ({})",
                "✓".green().bold(),
                &manifest.snapshot_id[..12].bold(),
                message
            );
            println!(
                "  Files: {}, Size: {:.2} MB",
                manifest.stats.total_files,
                manifest.stats.total_bytes as f64 / (1024.0 * 1024.0)
            );
        }

        Commands::LockCheck { file } => {
            let target_path = if file.is_absolute() {
                file
            } else {
                root.join(file)
            };

            println!(
                "{} Checking lock status for: {}",
                "->".cyan(),
                target_path.display()
            );

            let status = check_file_lock(&target_path);
            match status {
                LockStatus::Free => {
                    println!(
                        "{} File is FREE (No active exclusive lock detected). Ready for Push/Sync.",
                        "✓".green().bold()
                    );
                }
                LockStatus::Locked {
                    process_id,
                    process_name,
                    is_after_effects,
                } => {
                    println!(
                        "{} File is LOCKED!",
                        "!".red().bold()
                    );
                    if let Some(pid) = process_id {
                        println!("  Process ID  : {}", pid);
                    }
                    if let Some(name) = process_name {
                        println!("  Process Name: {}", name.yellow().bold());
                    }
                    if is_after_effects {
                        println!(
                            "  {} Detected active Adobe After Effects lock. Save and close file before pushing!",
                            "WARNING:".red().bold()
                        );
                    }
                }
            }
        }

        Commands::Status => {
            if !compsync_dir.exists() {
                eprintln!(
                    "{} Not a CompSync repository. Run `compsync init` first.",
                    "Error:".red().bold()
                );
                return Ok(());
            }

            let db = IndexDb::open(&compsync_dir.join("index.db"))?;
            let cached = db.get_all()?;

            println!("{} CompSync Repository Status", "==".cyan().bold());
            println!("  Root Path    : {}", root.display());
            println!("  Indexed Files: {}", cached.len());

            let mut aep_count = 0;
            for f in &cached {
                if f.canonical_path.ends_with(".aep") {
                    aep_count += 1;
                    let full_path = root.join(&f.canonical_path);
                    let lock = check_file_lock(&full_path);
                    let lock_badge = match lock {
                        LockStatus::Free => "[UNLOCKED]".green(),
                        LockStatus::Locked { .. } => "[LOCKED BY AE]".red().bold(),
                    };
                    println!("  AE Project   : {} {}", f.canonical_path.bold(), lock_badge);
                }
            }

            if aep_count == 0 {
                println!("  AE Projects  : No .aep file detected yet.");
            }
        }
    }

    Ok(())
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
