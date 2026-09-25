use crate::blake3_hasher::{self, ChunkHash};
use crate::db::{CachedFile, IndexDb};
use crate::ignore::IgnoreFilter;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::time::{Instant, SystemTime, UNIX_EPOCH};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ScannerError {
    #[error("I/O error during scan: {0}")]
    Io(#[from] io::Error),
    #[error("Database error during scan: {0}")]
    Db(#[from] crate::db::DbError),
    #[error("Hasher error: {0}")]
    Hasher(#[from] blake3_hasher::HasherError),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum FileChangeState {
    Added,
    Modified,
    Unchanged,
}

#[derive(Debug, Clone)]
pub struct ScannedFile {
    pub canonical_path: String,
    pub absolute_path: PathBuf,
    pub size_bytes: u64,
    pub mtime_epoch_ms: i64,
    pub blake3_hash: String,
    pub state: FileChangeState,
    pub chunks: Option<Vec<ChunkHash>>,
}

#[derive(Debug, Default)]
pub struct ScanSummary {
    pub total_files: usize,
    pub total_bytes: u64,
    pub cached_files: usize,
    pub hashed_files: usize,
    pub hashed_bytes: u64,
    pub deleted_files: usize,
    pub duration_ms: u128,
}

pub struct ProjectScanner<'a> {
    root_dir: &'a Path,
    db: &'a IndexDb,
    filter: IgnoreFilter,
}

impl<'a> ProjectScanner<'a> {
    pub fn new(root_dir: &'a Path, db: &'a IndexDb) -> Self {
        let filter = IgnoreFilter::new(root_dir);
        Self {
            root_dir,
            db,
            filter,
        }
    }

    /// Perform a high-speed incremental scan of the working directory
    pub fn scan(&self) -> Result<(Vec<ScannedFile>, ScanSummary), ScannerError> {
        let start_time = Instant::now();
        let mut scanned_files = Vec::new();
        let mut active_canonical_paths = Vec::new();
        let mut summary = ScanSummary::default();

        let mut dirs_to_visit = vec![self.root_dir.to_path_buf()];

        while let Some(current_dir) = dirs_to_visit.pop() {
            let entries = match fs::read_dir(&current_dir) {
                Ok(entries) => entries,
                Err(_) => continue, // Skip inaccessible directories
            };

            for entry in entries.flatten() {
                let path = entry.path();
                let file_name = entry.file_name();
                let file_name_str = file_name.to_string_lossy();

                // Skip internal .compsync directly
                if file_name_str == ".compsync" {
                    continue;
                }

                let rel_path = match path.strip_prefix(self.root_dir) {
                    Ok(p) => p,
                    Err(_) => continue,
                };

                let is_dir = path.is_dir();

                // Check ignore rules
                if self.filter.is_ignored(rel_path, is_dir) {
                    continue;
                }

                if is_dir {
                    dirs_to_visit.push(path);
                } else if path.is_file() {
                    // Standardize canonical path with forward slashes for cross-platform compatibility
                    let canonical_path = rel_path
                        .components()
                        .map(|c| c.as_os_str().to_string_lossy())
                        .collect::<Vec<_>>()
                        .join("/");

                    active_canonical_paths.push(canonical_path.clone());

                    let metadata = match entry.metadata() {
                        Ok(m) => m,
                        Err(_) => continue,
                    };

                    let size_bytes = metadata.len();
                    let mtime_epoch_ms = metadata
                        .modified()
                        .unwrap_or_else(|_| SystemTime::now())
                        .duration_since(UNIX_EPOCH)
                        .map(|d| d.as_millis() as i64)
                        .unwrap_or(0);

                    // Check cache in SQLite index
                    let cached = self.db.get(&canonical_path)?;
                    let now_epoch_ms = SystemTime::now()
                        .duration_since(UNIX_EPOCH)
                        .map(|d| d.as_millis() as i64)
                        .unwrap_or(0);

                    let (hash, state, chunks) = match cached {
                        Some(ref c)
                            if c.size_bytes == size_bytes && c.mtime_epoch_ms == mtime_epoch_ms =>
                        {
                            if size_bytes > blake3_hasher::CHUNK_SIZE as u64 {
                                // Large cached files still need chunk hashes for transfer manifests.
                                summary.hashed_files += 1;
                                summary.hashed_bytes += size_bytes;
                                let hash_res = blake3_hasher::hash_file(&path)?;
                                let state = if hash_res.whole_file_hash == c.blake3_hash {
                                    FileChangeState::Unchanged
                                } else {
                                    FileChangeState::Modified
                                };

                                self.db.upsert(&CachedFile {
                                    canonical_path: canonical_path.clone(),
                                    size_bytes,
                                    mtime_epoch_ms,
                                    blake3_hash: hash_res.whole_file_hash.clone(),
                                    last_scanned: now_epoch_ms,
                                })?;

                                (hash_res.whole_file_hash, state, Some(hash_res.chunks))
                            } else {
                                // Small unchanged file - cache hit, no hashing needed.
                                summary.cached_files += 1;
                                (c.blake3_hash.clone(), FileChangeState::Unchanged, None)
                            }
                        }
                        Some(_) => {
                            // Modified file - hash needed
                            summary.hashed_files += 1;
                            summary.hashed_bytes += size_bytes;
                            let hash_res = blake3_hasher::hash_file(&path)?;

                            let chunks = if size_bytes > blake3_hasher::CHUNK_SIZE as u64 {
                                Some(hash_res.chunks)
                            } else {
                                None
                            };

                            self.db.upsert(&CachedFile {
                                canonical_path: canonical_path.clone(),
                                size_bytes,
                                mtime_epoch_ms,
                                blake3_hash: hash_res.whole_file_hash.clone(),
                                last_scanned: now_epoch_ms,
                            })?;

                            (hash_res.whole_file_hash, FileChangeState::Modified, chunks)
                        }
                        None => {
                            // Added file - hash needed
                            summary.hashed_files += 1;
                            summary.hashed_bytes += size_bytes;
                            let hash_res = blake3_hasher::hash_file(&path)?;

                            let chunks = if size_bytes > blake3_hasher::CHUNK_SIZE as u64 {
                                Some(hash_res.chunks)
                            } else {
                                None
                            };

                            self.db.upsert(&CachedFile {
                                canonical_path: canonical_path.clone(),
                                size_bytes,
                                mtime_epoch_ms,
                                blake3_hash: hash_res.whole_file_hash.clone(),
                                last_scanned: now_epoch_ms,
                            })?;

                            (hash_res.whole_file_hash, FileChangeState::Added, chunks)
                        }
                    };

                    summary.total_files += 1;
                    summary.total_bytes += size_bytes;

                    scanned_files.push(ScannedFile {
                        canonical_path,
                        absolute_path: path,
                        size_bytes,
                        mtime_epoch_ms,
                        blake3_hash: hash,
                        state,
                        chunks,
                    });
                }
            }
        }

        // Clean up deleted records in database
        let deleted = self.db.remove_stale(&active_canonical_paths)?;
        summary.deleted_files = deleted;
        summary.duration_ms = start_time.elapsed().as_millis();

        // Sort files canonically
        scanned_files.sort_by(|a, b| a.canonical_path.cmp(&b.canonical_path));

        Ok((scanned_files, summary))
    }
}
