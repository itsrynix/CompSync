use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::path::Path;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DbError {
    #[error("SQLite error: {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error("Database file error: {0}")]
    Io(#[from] std::io::Error),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct CachedFile {
    pub canonical_path: String,
    pub size_bytes: u64,
    pub mtime_epoch_ms: i64,
    pub blake3_hash: String,
    pub last_scanned: i64,
}

pub struct IndexDb {
    conn: Connection,
}

impl IndexDb {
    /// Open SQLite database with Write-Ahead Logging (WAL) enabled
    pub fn open(db_path: &Path) -> Result<Self, DbError> {
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let conn = Connection::open(db_path)?;

        // Performance & ACID safety pragmas
        conn.execute_batch(
            "PRAGMA journal_mode = WAL;
             PRAGMA synchronous = NORMAL;
             PRAGMA busy_timeout = 5000;
             PRAGMA temp_store = MEMORY;
             CREATE TABLE IF NOT EXISTS file_index (
                 canonical_path TEXT PRIMARY KEY,
                 size_bytes INTEGER NOT NULL,
                 mtime_epoch_ms INTEGER NOT NULL,
                 blake3_hash TEXT NOT NULL,
                 last_scanned INTEGER NOT NULL
             );
             CREATE INDEX IF NOT EXISTS idx_mtime ON file_index(mtime_epoch_ms);",
        )?;

        Ok(Self { conn })
    }

    /// Retrieve cached record for a file
    pub fn get(&self, canonical_path: &str) -> Result<Option<CachedFile>, DbError> {
        let mut stmt = self.conn.prepare(
            "SELECT canonical_path, size_bytes, mtime_epoch_ms, blake3_hash, last_scanned
             FROM file_index WHERE canonical_path = ?1",
        )?;

        let mut rows = stmt.query(params![canonical_path])?;
        if let Some(row) = rows.next()? {
            let size_i64: i64 = row.get(1)?;
            Ok(Some(CachedFile {
                canonical_path: row.get(0)?,
                size_bytes: size_i64 as u64,
                mtime_epoch_ms: row.get(2)?,
                blake3_hash: row.get(3)?,
                last_scanned: row.get(4)?,
            }))
        } else {
            Ok(None)
        }
    }

    /// Insert or update file cache record
    pub fn upsert(&self, file: &CachedFile) -> Result<(), DbError> {
        self.conn.execute(
            "INSERT INTO file_index (canonical_path, size_bytes, mtime_epoch_ms, blake3_hash, last_scanned)
             VALUES (?1, ?2, ?3, ?4, ?5)
             ON CONFLICT(canonical_path) DO UPDATE SET
                 size_bytes = excluded.size_bytes,
                 mtime_epoch_ms = excluded.mtime_epoch_ms,
                 blake3_hash = excluded.blake3_hash,
                 last_scanned = excluded.last_scanned",
            params![
                file.canonical_path,
                file.size_bytes as i64,
                file.mtime_epoch_ms,
                file.blake3_hash,
                file.last_scanned,
            ],
        )?;
        Ok(())
    }

    /// Delete file cache record by canonical path
    pub fn delete(&self, canonical_path: &str) -> Result<(), DbError> {
        self.conn.execute(
            "DELETE FROM file_index WHERE canonical_path = ?1",
            params![canonical_path],
        )?;
        Ok(())
    }

    /// Get all indexed files
    pub fn get_all(&self) -> Result<Vec<CachedFile>, DbError> {
        let mut stmt = self.conn.prepare(
            "SELECT canonical_path, size_bytes, mtime_epoch_ms, blake3_hash, last_scanned
             FROM file_index ORDER BY canonical_path ASC",
        )?;

        let rows = stmt.query_map([], |row| {
            let size_i64: i64 = row.get(1)?;
            Ok(CachedFile {
                canonical_path: row.get(0)?,
                size_bytes: size_i64 as u64,
                mtime_epoch_ms: row.get(2)?,
                blake3_hash: row.get(3)?,
                last_scanned: row.get(4)?,
            })
        })?;

        let mut results = Vec::new();
        for item in rows {
            results.push(item?);
        }
        Ok(results)
    }

    /// Remove cached files that no longer exist on disk
    pub fn remove_stale(&self, active_paths: &[String]) -> Result<usize, DbError> {
        let all_files = self.get_all()?;
        let mut removed = 0;
        for file in all_files {
            if !active_paths.iter().any(|p| p == &file.canonical_path) {
                self.delete(&file.canonical_path)?;
                removed += 1;
            }
        }
        Ok(removed)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_sqlite_wal_operations() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("index.db");
        let db = IndexDb::open(&db_path).unwrap();

        let file = CachedFile {
            canonical_path: "Projects/Main.aep".to_string(),
            size_bytes: 1048576,
            mtime_epoch_ms: 1700000000000,
            blake3_hash: "abcdef123456".to_string(),
            last_scanned: 1700000001000,
        };

        db.upsert(&file).unwrap();
        let retrieved = db.get("Projects/Main.aep").unwrap().unwrap();
        assert_eq!(retrieved, file);

        let all = db.get_all().unwrap();
        assert_eq!(all.len(), 1);

        db.delete("Projects/Main.aep").unwrap();
        let none = db.get("Projects/Main.aep").unwrap();
        assert!(none.is_none());
    }
}
