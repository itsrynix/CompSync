use compsync_core::blake3_hasher;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs::{self, File, OpenOptions};
use std::io::{self, Seek, SeekFrom, Write};
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize, Deserialize)]
struct StagingMeta {
    file_hash: String,
    total_size: u64,
    total_chunks: usize,
    completed_chunks: HashSet<usize>,
}

pub struct StagingFile {
    staging_dir: PathBuf,
    part_path: PathBuf,
    meta_path: PathBuf,
    meta: StagingMeta,
}

impl StagingFile {
    /// Create or resume an inbound file transfer in staging
    pub fn open_or_create(
        staging_root: &Path,
        file_hash: &str,
        total_size: u64,
        total_chunks: usize,
    ) -> Result<Self, io::Error> {
        let staging_dir = staging_root.join(file_hash);
        fs::create_dir_all(&staging_dir)?;

        let part_path = staging_dir.join("target.part");
        let meta_path = staging_dir.join("meta.json");

        let meta = if meta_path.exists() {
            let bytes = fs::read(&meta_path)?;
            serde_json::from_slice(&bytes).unwrap_or_else(|_| StagingMeta {
                file_hash: file_hash.to_string(),
                total_size,
                total_chunks,
                completed_chunks: HashSet::new(),
            })
        } else {
            let file = File::create(&part_path)?;
            file.set_len(total_size)?;
            StagingMeta {
                file_hash: file_hash.to_string(),
                total_size,
                total_chunks,
                completed_chunks: HashSet::new(),
            }
        };

        Ok(Self {
            staging_dir,
            part_path,
            meta_path,
            meta,
        })
    }

    /// Check if a chunk was already downloaded and verified
    pub fn is_chunk_completed(&self, chunk_index: usize) -> bool {
        self.meta.completed_chunks.contains(&chunk_index)
    }

    /// Returns list of missing chunk indices for resume negotiation
    pub fn get_missing_chunks(&self) -> Vec<usize> {
        let mut missing = Vec::new();
        for i in 0..self.meta.total_chunks {
            if !self.meta.completed_chunks.contains(&i) {
                missing.push(i);
            }
        }
        missing
    }

    /// Write and verify incoming chunk data
    pub fn write_chunk(
        &mut self,
        chunk_index: usize,
        offset: u64,
        data: &[u8],
        expected_chunk_hash: &str,
    ) -> Result<bool, io::Error> {
        let computed_hash = blake3_hasher::hash_bytes(data);
        if computed_hash != expected_chunk_hash {
            return Ok(false);
        }

        let mut file = OpenOptions::new().write(true).open(&self.part_path)?;
        file.seek(SeekFrom::Start(offset))?;
        file.write_all(data)?;
        file.flush()?;

        self.meta.completed_chunks.insert(chunk_index);
        let meta_bytes = serde_json::to_vec(&self.meta)?;
        fs::write(&self.meta_path, meta_bytes)?;

        Ok(true)
    }

    /// Check if all chunks are in place
    pub fn is_complete(&self) -> bool {
        self.meta.completed_chunks.len() >= self.meta.total_chunks
    }

    /// Finalize: verify whole file BLAKE3 hash and atomically move into target location
    pub fn finalize(&self, dest_path: &Path, expected_whole_hash: &str) -> Result<bool, io::Error> {
        if !self.is_complete() {
            return Ok(false);
        }

        let hash_res = blake3_hasher::hash_file(&self.part_path)
            .map_err(|e| io::Error::new(io::ErrorKind::Other, e.to_string()))?;

        if hash_res.whole_file_hash != expected_whole_hash {
            return Ok(false);
        }

        if let Some(parent) = dest_path.parent() {
            fs::create_dir_all(parent)?;
        }

        fs::rename(&self.part_path, dest_path)?;
        let _ = fs::remove_dir_all(&self.staging_dir);

        Ok(true)
    }
}
