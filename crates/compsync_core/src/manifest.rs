use crate::blake3_hasher::ChunkHash;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fs;
use std::io;
use std::path::Path;
use thiserror::Error;
use uuid::Uuid;

#[derive(Error, Debug)]
pub enum ManifestError {
    #[error("I/O error with manifest: {0}")]
    Io(#[from] io::Error),
    #[error("Serialization error: {0}")]
    Serde(#[from] serde_json::Error),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Author {
    pub device_id: String,
    pub device_name: String,
    pub os: String,
    pub user_alias: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct AepTarget {
    pub canonical_path: String,
    pub blake3_hash: String,
    pub size_bytes: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ae_version_hint: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ProjectStats {
    pub total_files: usize,
    pub total_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ManifestFileEntry {
    pub path: String, // Normalized canonical relative path with '/'
    pub size_bytes: u64,
    pub mtime_epoch_ms: i64,
    pub blake3_hash: String,
    pub chunk_strategy: String, // "monolithic" | "chunked"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub chunks: Option<Vec<ChunkHash>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Manifest {
    pub schema_version: String,
    pub project_id: Uuid,
    pub snapshot_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_snapshot_id: Option<String>,
    pub created_at: DateTime<Utc>,
    pub author: Author,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub aep_target: Option<AepTarget>,
    pub stats: ProjectStats,
    pub tree: Vec<ManifestFileEntry>,
}

impl Manifest {
    pub fn new(
        project_id: Uuid,
        parent_snapshot_id: Option<String>,
        author: Author,
        message: String,
        aep_target: Option<AepTarget>,
        tree: Vec<ManifestFileEntry>,
    ) -> Self {
        let total_files = tree.len();
        let total_bytes = tree.iter().map(|e| e.size_bytes).sum();

        let mut manifest = Self {
            schema_version: "1.0.0".to_string(),
            project_id,
            snapshot_id: String::new(),
            parent_snapshot_id,
            created_at: Utc::now(),
            author,
            message,
            aep_target,
            stats: ProjectStats {
                total_files,
                total_bytes,
            },
            tree,
        };

        // Compute deterministic snapshot ID from the tree contents and parent ID
        manifest.snapshot_id = manifest.compute_snapshot_id();
        manifest
    }

    pub fn compute_snapshot_id(&self) -> String {
        let mut hasher = blake3::Hasher::new();
        hasher.update(self.project_id.as_bytes());
        if let Some(ref parent) = self.parent_snapshot_id {
            hasher.update(parent.as_bytes());
        }
        for entry in &self.tree {
            hasher.update(entry.path.as_bytes());
            hasher.update(&entry.size_bytes.to_le_bytes());
            hasher.update(entry.blake3_hash.as_bytes());
        }
        hasher.finalize().to_hex().to_string()
    }

    /// Save snapshot JSON to `.compsync/objects/snapshots/<snapshot_id>.json`
    pub fn save_to_objects(&self, compsync_dir: &Path) -> Result<(), ManifestError> {
        let snapshots_dir = compsync_dir.join("objects").join("snapshots");
        fs::create_dir_all(&snapshots_dir)?;

        let target_file = snapshots_dir.join(format!("{}.json", self.snapshot_id));
        let json_bytes = serde_json::to_vec_pretty(self)?;
        fs::write(target_file, json_bytes)?;
        Ok(())
    }

    /// Load snapshot JSON from file
    pub fn load_from_file(path: &Path) -> Result<Self, ManifestError> {
        let file = fs::File::open(path)?;
        let manifest: Self = serde_json::from_reader(file)?;
        Ok(manifest)
    }
}
