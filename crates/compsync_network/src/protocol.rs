use bytes::Bytes;
use serde::{Deserialize, Serialize};
use thiserror::Error;
use uuid::Uuid;

pub const DEFAULT_TCP_PORT: u16 = 52424;
pub const DEFAULT_UDP_PORT: u16 = 52425;
pub const MAX_FRAME_SIZE: usize = 128 * 1024 * 1024; // 128 MB to handle 64MB chunks

#[derive(Error, Debug)]
pub enum ProtocolError {
    #[error("Serialization error: {0}")]
    Bincode(#[from] bincode::Error),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Handshake rejected: {0}")]
    HandshakeRejected(String),
    #[error("Sync cancelled")]
    Cancelled,
    #[error("Chunk verification failed for {file_hash} chunk {chunk_index}")]
    ChunkCorrupted {
        file_hash: String,
        chunk_index: usize,
    },
    #[error("Protocol out of sync: expected {expected}, received {received}")]
    OutOfSync { expected: String, received: String },
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct HelloMessage {
    pub device_id: String,
    pub device_name: String,
    pub project_id: Uuid,
    pub head_snapshot_id: Option<String>,
    pub is_locked: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ChunkRequest {
    pub path: String,
    pub file_hash: String,
    pub chunk_index: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChunkFrame {
    pub file_hash: String,
    pub chunk_index: usize,
    pub offset: u64,
    pub length: usize,
    pub data: Vec<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ChunkAck {
    pub file_hash: String,
    pub chunk_index: usize,
    pub ok: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Message {
    Hello(HelloMessage),
    HelloAck {
        accepted: bool,
        reason: Option<String>,
    },
    RequestManifest,
    ManifestData {
        manifest_json: String,
    },
    RequestChunks {
        requests: Vec<ChunkRequest>,
    },
    ChunkData(ChunkFrame),
    Ack(ChunkAck),
    SyncComplete {
        snapshot_id: String,
    },
}

impl Message {
    pub fn encode(&self) -> Result<Bytes, ProtocolError> {
        let vec = bincode::serialize(self)?;
        Ok(Bytes::from(vec))
    }

    pub fn decode(bytes: &[u8]) -> Result<Self, ProtocolError> {
        let msg = bincode::deserialize(bytes)?;
        Ok(msg)
    }
}
