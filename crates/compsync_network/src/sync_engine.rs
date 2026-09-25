use crate::protocol::{
    ChunkFrame, ChunkRequest, HelloMessage, Message, ProtocolError, MAX_FRAME_SIZE,
};
use crate::staging::StagingFile;
use compsync_core::manifest::Manifest;
use compsync_core::CHUNK_SIZE;
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::Instant;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::RwLock;
use tokio_util::codec::LengthDelimitedCodec;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncProgress {
    pub total_bytes: u64,
    pub transferred_bytes: u64,
    pub total_chunks: usize,
    pub completed_chunks: usize,
    pub current_file: String,
    pub speed_mbps: f64,
    pub is_finished: bool,
}

pub struct SyncEngine {
    project_root: PathBuf,
    compsync_dir: PathBuf,
    device_id: String,
    device_name: String,
    project_id: Uuid,
}

impl SyncEngine {
    pub fn new(
        project_root: PathBuf,
        device_id: String,
        device_name: String,
        project_id: Uuid,
    ) -> Self {
        let compsync_dir = project_root.join(".compsync");
        Self {
            project_root,
            compsync_dir,
            device_id,
            device_name,
            project_id,
        }
    }

    /// Run background TCP sync listener
    pub async fn run_server(
        &self,
        tcp_port: u16,
        is_locked_flag: Arc<RwLock<bool>>,
    ) -> Result<(), std::io::Error> {
        let listener = TcpListener::bind(format!("0.0.0.0:{}", tcp_port)).await?;
        let project_root = self.project_root.clone();
        let compsync_dir = self.compsync_dir.clone();
        let dev_id = self.device_id.clone();
        let dev_name = self.device_name.clone();
        let proj_id = self.project_id;

        tokio::spawn(async move {
            loop {
                if let Ok((socket, _)) = listener.accept().await {
                    let p_root = project_root.clone();
                    let c_dir = compsync_dir.clone();
                    let d_id = dev_id.clone();
                    let d_name = dev_name.clone();
                    let lock_flag = Arc::clone(&is_locked_flag);

                    tokio::spawn(async move {
                        let _ = Self::handle_server_connection(
                            socket, p_root, c_dir, d_id, d_name, proj_id, lock_flag,
                        )
                        .await;
                    });
                }
            }
        });

        Ok(())
    }

    async fn handle_server_connection(
        socket: TcpStream,
        project_root: PathBuf,
        compsync_dir: PathBuf,
        _device_id: String,
        _device_name: String,
        project_id: Uuid,
        _is_locked_flag: Arc<RwLock<bool>>,
    ) -> Result<(), ProtocolError> {
        let mut framed = LengthDelimitedCodec::builder()
            .max_frame_length(MAX_FRAME_SIZE)
            .new_framed(socket);

        // 1. Await Hello
        if let Some(Ok(frame)) = framed.next().await {
            let msg = Message::decode(&frame)?;
            if let Message::Hello(hello) = msg {
                if hello.project_id != project_id {
                    let rej = Message::HelloAck {
                        accepted: false,
                        reason: Some("Project UUID mismatch".to_string()),
                    };
                    framed.send(rej.encode()?).await?;
                    return Ok(());
                }

                let ack = Message::HelloAck {
                    accepted: true,
                    reason: None,
                };
                framed.send(ack.encode()?).await?;
            } else {
                return Err(ProtocolError::OutOfSync {
                    expected: "Hello".into(),
                    received: "Other".into(),
                });
            }
        }

        // 2. Event loop: Respond to Manifest requests and Chunk requests
        while let Some(Ok(frame)) = framed.next().await {
            let msg = Message::decode(&frame)?;
            match msg {
                Message::RequestManifest => {
                    // Send latest snapshot manifest
                    let snapshots_dir = compsync_dir.join("objects").join("snapshots");
                    let mut latest_manifest_json = String::new();

                    if let Ok(entries) = std::fs::read_dir(&snapshots_dir) {
                        let mut files: Vec<PathBuf> = entries
                            .filter_map(|e| e.ok().map(|e| e.path()))
                            .filter(|p| p.extension().map_or(false, |ext| ext == "json"))
                            .collect();
                        files.sort_by_key(|f| {
                            f.metadata()
                                .and_then(|m| m.modified())
                                .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
                        });

                        if let Some(latest) = files.last() {
                            if let Ok(content) = std::fs::read_to_string(latest) {
                                latest_manifest_json = content;
                            }
                        }
                    }

                    let resp = Message::ManifestData {
                        manifest_json: latest_manifest_json,
                    };
                    framed.send(resp.encode()?).await?;
                }
                Message::RequestChunks { requests } => {
                    for req in requests {
                        if let Some(chunk_frame) = Self::read_local_chunk(
                            &project_root,
                            &req.path,
                            &req.file_hash,
                            req.chunk_index,
                        ) {
                            framed
                                .send(Message::ChunkData(chunk_frame).encode()?)
                                .await?;
                        }
                    }
                }
                Message::SyncComplete { .. } => {
                    break;
                }
                _ => {}
            }
        }

        Ok(())
    }

    fn read_local_chunk(
        project_root: &Path,
        relative_path: &str,
        file_hash: &str,
        chunk_index: usize,
    ) -> Option<ChunkFrame> {
        let path = project_root.join(relative_path);
        if !path.starts_with(project_root) || !path.is_file() {
            return None;
        }

        let offset = (chunk_index * CHUNK_SIZE) as u64;
        if let Ok(mut file) = File::open(path) {
            if let Ok(meta) = file.metadata() {
                if meta.len() > offset {
                    let chunk_length = (meta.len() - offset).min(CHUNK_SIZE as u64) as usize;
                    let mut buffer = vec![0u8; chunk_length];
                    if file.seek(SeekFrom::Start(offset)).is_ok() {
                        if file.read_exact(&mut buffer).is_ok() {
                            return Some(ChunkFrame {
                                file_hash: file_hash.to_string(),
                                chunk_index,
                                offset,
                                length: buffer.len(),
                                data: buffer,
                            });
                        }
                    }
                }
            }
        }
        None
    }

    /// Pull changes from remote peer workstation with progress reporting
    pub async fn pull_from_peer<F>(
        &self,
        peer_ip: &str,
        peer_port: u16,
        progress_cb: F,
    ) -> Result<String, ProtocolError>
    where
        F: Fn(SyncProgress) + Send + 'static,
    {
        let socket = TcpStream::connect(format!("{}:{}", peer_ip, peer_port))
            .await
            .map_err(ProtocolError::Io)?;

        let mut framed = LengthDelimitedCodec::builder()
            .max_frame_length(MAX_FRAME_SIZE)
            .new_framed(socket);

        // 1. Send Hello
        let hello = Message::Hello(HelloMessage {
            device_id: self.device_id.clone(),
            device_name: self.device_name.clone(),
            project_id: self.project_id,
            head_snapshot_id: None,
            is_locked: false,
        });
        framed.send(hello.encode()?).await?;

        // 2. Receive HelloAck
        if let Some(Ok(frame)) = framed.next().await {
            let msg = Message::decode(&frame)?;
            if let Message::HelloAck { accepted, reason } = msg {
                if !accepted {
                    return Err(ProtocolError::HandshakeRejected(
                        reason.unwrap_or_else(|| "Unknown".to_string()),
                    ));
                }
            }
        }

        // 3. Request Manifest
        framed.send(Message::RequestManifest.encode()?).await?;

        let manifest_json = if let Some(Ok(frame)) = framed.next().await {
            let msg = Message::decode(&frame)?;
            if let Message::ManifestData { manifest_json } = msg {
                manifest_json
            } else {
                return Err(ProtocolError::OutOfSync {
                    expected: "ManifestData".into(),
                    received: "Other".into(),
                });
            }
        } else {
            return Err(ProtocolError::OutOfSync {
                expected: "ManifestData".into(),
                received: "EOF".into(),
            });
        };

        if manifest_json.is_empty() {
            return Ok("Peer has no snapshots yet.".to_string());
        }

        let remote_manifest: Manifest = serde_json::from_str(&manifest_json)
            .map_err(|e| ProtocolError::HandshakeRejected(e.to_string()))?;

        // 4. Determine missing files and chunks
        let staging_root = self.compsync_dir.join("staging");
        std::fs::create_dir_all(&staging_root).map_err(ProtocolError::Io)?;

        let total_bytes = remote_manifest.stats.total_bytes;
        let mut transferred_bytes = 0u64;
        let start_time = Instant::now();

        for file_entry in &remote_manifest.tree {
            let dest_path = self.project_root.join(&file_entry.path);

            if dest_path.exists() {
                if let Ok(meta) = dest_path.metadata() {
                    if meta.len() == file_entry.size_bytes {
                        if let Ok(h) = compsync_core::hash_file(&dest_path) {
                            if h.whole_file_hash == file_entry.blake3_hash {
                                transferred_bytes += file_entry.size_bytes;
                                continue;
                            }
                        }
                    }
                }
            }

            let num_chunks = (file_entry.size_bytes as usize + CHUNK_SIZE - 1) / CHUNK_SIZE;
            let mut staging = StagingFile::open_or_create(
                &staging_root,
                &file_entry.blake3_hash,
                file_entry.size_bytes,
                num_chunks,
            )
            .map_err(ProtocolError::Io)?;

            let missing_chunks = staging.get_missing_chunks();
            if !missing_chunks.is_empty() {
                let requests: Vec<ChunkRequest> = missing_chunks
                    .into_iter()
                    .map(|idx| ChunkRequest {
                        path: file_entry.path.clone(),
                        file_hash: file_entry.blake3_hash.clone(),
                        chunk_index: idx,
                    })
                    .collect();

                framed
                    .send(Message::RequestChunks { requests }.encode()?)
                    .await?;

                while !staging.is_complete() {
                    if let Some(Ok(frame)) = framed.next().await {
                        let msg = Message::decode(&frame)?;
                        if let Message::ChunkData(chunk) = msg {
                            if chunk.file_hash != file_entry.blake3_hash
                                || chunk.chunk_index >= num_chunks
                            {
                                return Err(ProtocolError::ChunkCorrupted {
                                    file_hash: file_entry.blake3_hash.clone(),
                                    chunk_index: chunk.chunk_index,
                                });
                            }

                            let expected_chunk_hash = if let Some(ref chunks) = file_entry.chunks {
                                chunks
                                    .iter()
                                    .find(|c| c.index == chunk.chunk_index)
                                    .map(|c| c.hash.as_str())
                                    .unwrap_or(&file_entry.blake3_hash)
                            } else {
                                &file_entry.blake3_hash
                            };

                            let ok = staging
                                .write_chunk(
                                    chunk.chunk_index,
                                    chunk.offset,
                                    &chunk.data,
                                    expected_chunk_hash,
                                )
                                .map_err(ProtocolError::Io)?;

                            if ok {
                                transferred_bytes += chunk.length as u64;
                                let elapsed = start_time.elapsed().as_secs_f64();
                                let speed = if elapsed > 0.0 {
                                    (transferred_bytes as f64 / elapsed) / (1024.0 * 1024.0)
                                } else {
                                    0.0
                                };

                                progress_cb(SyncProgress {
                                    total_bytes,
                                    transferred_bytes,
                                    total_chunks: num_chunks,
                                    completed_chunks: chunk.chunk_index + 1,
                                    current_file: file_entry.path.clone(),
                                    speed_mbps: speed,
                                    is_finished: false,
                                });
                            } else {
                                return Err(ProtocolError::ChunkCorrupted {
                                    file_hash: file_entry.blake3_hash.clone(),
                                    chunk_index: chunk.chunk_index,
                                });
                            }
                        }
                    } else {
                        return Err(ProtocolError::OutOfSync {
                            expected: "ChunkData".into(),
                            received: "EOF".into(),
                        });
                    }
                }
            }

            let _ = staging.finalize(&dest_path, &file_entry.blake3_hash);
        }

        let _ = remote_manifest.save_to_objects(&self.compsync_dir);

        let _ = framed
            .send(
                Message::SyncComplete {
                    snapshot_id: remote_manifest.snapshot_id.clone(),
                }
                .encode()?,
            )
            .await;

        progress_cb(SyncProgress {
            total_bytes,
            transferred_bytes: total_bytes,
            total_chunks: 100,
            completed_chunks: 100,
            current_file: "Completed".into(),
            speed_mbps: 0.0,
            is_finished: true,
        });

        Ok(remote_manifest.snapshot_id)
    }
}
