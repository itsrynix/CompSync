use memmap2::Mmap;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::{self, Read};
use std::path::Path;
use thiserror::Error;

pub const CHUNK_SIZE: usize = 64 * 1024 * 1024; // 64 MB ideal chunk size for high-speed LAN

#[derive(Error, Debug)]
pub enum HasherError {
    #[error("I/O error during hashing: {0}")]
    Io(#[from] io::Error),
    #[error("Empty file path provided")]
    InvalidPath,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ChunkHash {
    pub index: usize,
    pub offset: u64,
    pub length: usize,
    pub hash: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct FileHashResult {
    pub whole_file_hash: String,
    pub chunks: Vec<ChunkHash>,
    pub size_bytes: u64,
}

/// Compute BLAKE3 hex hash for in-memory buffer
pub fn hash_bytes(data: &[u8]) -> String {
    blake3::hash(data).to_hex().to_string()
}

/// Hashes a file using SIMD-accelerated BLAKE3 and parallel Rayon chunk processing.
/// Memory-mapping is utilized for maximum throughput on NVMe and SSD drives.
pub fn hash_file(path: &Path) -> Result<FileHashResult, HasherError> {
    let file = File::open(path)?;
    let metadata = file.metadata()?;
    let size_bytes = metadata.len();

    if size_bytes == 0 {
        let empty_hash = blake3::hash(&[]).to_hex().to_string();
        return Ok(FileHashResult {
            whole_file_hash: empty_hash,
            chunks: Vec::new(),
            size_bytes: 0,
        });
    }

    // Try memory-mapping the file
    let mmap = unsafe { Mmap::map(&file) };

    match mmap {
        Ok(mmap) => {
            // Compute whole-file hash using SIMD multi-threaded tree hashing
            let mut whole_hasher = blake3::Hasher::new();
            whole_hasher.update_rayon(&mmap);
            let whole_file_hash = whole_hasher.finalize().to_hex().to_string();

            // Calculate 64MB chunks
            let num_chunks = (size_bytes as usize + CHUNK_SIZE - 1) / CHUNK_SIZE;
            let chunks: Vec<ChunkHash> = (0..num_chunks)
                .into_par_iter()
                .map(|idx| {
                    let offset = (idx * CHUNK_SIZE) as u64;
                    let end = ((idx + 1) * CHUNK_SIZE).min(size_bytes as usize);
                    let slice = &mmap[(offset as usize)..end];
                    let chunk_hash = blake3::hash(slice).to_hex().to_string();

                    ChunkHash {
                        index: idx,
                        offset,
                        length: slice.len(),
                        hash: chunk_hash,
                    }
                })
                .collect();

            Ok(FileHashResult {
                whole_file_hash,
                chunks,
                size_bytes,
            })
        }
        Err(_) => {
            // Fallback to streaming buffer if mmap is unsupported or fails (e.g. some network drives)
            hash_file_streaming(file, size_bytes)
        }
    }
}

fn hash_file_streaming(mut file: File, size_bytes: u64) -> Result<FileHashResult, HasherError> {
    let mut whole_hasher = blake3::Hasher::new();
    let mut chunks = Vec::new();
    let mut buffer = vec![0u8; CHUNK_SIZE];
    let mut offset: u64 = 0;
    let mut index = 0;

    loop {
        let mut read_bytes = 0;
        while read_bytes < CHUNK_SIZE {
            let bytes = file.read(&mut buffer[read_bytes..])?;
            if bytes == 0 {
                break;
            }
            read_bytes += bytes;
        }

        if read_bytes == 0 {
            break;
        }

        let slice = &buffer[..read_bytes];
        whole_hasher.update(slice);

        let chunk_hash = blake3::hash(slice).to_hex().to_string();
        chunks.push(ChunkHash {
            index,
            offset,
            length: read_bytes,
            hash: chunk_hash,
        });

        offset += read_bytes as u64;
        index += 1;
    }

    Ok(FileHashResult {
        whole_file_hash: whole_hasher.finalize().to_hex().to_string(),
        chunks,
        size_bytes,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::NamedTempFile;

    #[test]
    fn test_empty_file_hash() {
        let temp = NamedTempFile::new().unwrap();
        let result = hash_file(temp.path()).unwrap();
        assert_eq!(result.size_bytes, 0);
        assert_eq!(result.chunks.len(), 0);
        assert_eq!(
            result.whole_file_hash,
            blake3::hash(&[]).to_hex().to_string()
        );
    }

    #[test]
    fn test_small_file_hash() {
        let mut temp = NamedTempFile::new().unwrap();
        let content = b"CompSync Adobe After Effects Version Control";
        temp.write_all(content).unwrap();
        temp.flush().unwrap();

        let result = hash_file(temp.path()).unwrap();
        assert_eq!(result.size_bytes, content.len() as u64);
        assert_eq!(result.chunks.len(), 1);
        assert_eq!(result.whole_file_hash, hash_bytes(content));
        assert_eq!(result.chunks[0].hash, hash_bytes(content));
    }
}
