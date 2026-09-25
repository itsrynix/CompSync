use crate::protocol::DEFAULT_UDP_PORT;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tokio::net::UdpSocket;
use tokio::sync::RwLock;
use uuid::Uuid;

pub const MAGIC_BEACON: [u8; 4] = *b"CMPY";

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct PeerInfo {
    pub device_id: String,
    pub device_name: String,
    pub project_id: Uuid,
    pub tcp_port: u16,
    pub ip_addr: String,
    pub is_locked: bool,
    pub last_seen_epoch_secs: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BeaconPayload {
    pub magic: [u8; 4],
    pub device_id: String,
    pub device_name: String,
    pub project_id: Uuid,
    pub tcp_port: u16,
    pub is_locked: bool,
}

pub struct DiscoveryManager {
    peers: Arc<RwLock<HashMap<String, PeerInfo>>>,
    my_device_id: String,
    my_project_id: Uuid,
}

impl DiscoveryManager {
    pub fn new(my_device_id: String, my_project_id: Uuid) -> Self {
        Self {
            peers: Arc::new(RwLock::new(HashMap::new())),
            my_device_id,
            my_project_id,
        }
    }

    /// Returns a snapshot list of currently active LAN peers for this project
    pub async fn get_peers(&self) -> Vec<PeerInfo> {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0);

        let mut lock = self.peers.write().await;
        // Prune peers inactive for more than 7 seconds
        lock.retain(|_, peer| now.saturating_sub(peer.last_seen_epoch_secs) < 7);
        lock.values().cloned().collect()
    }

    /// Spawns UDP broadcast sender to announce presence to the local network
    pub fn start_announcer(
        &self,
        device_name: String,
        tcp_port: u16,
        is_locked_flag: Arc<RwLock<bool>>,
    ) {
        let my_dev_id = self.my_device_id.clone();
        let my_proj_id = self.my_project_id;

        tokio::spawn(async move {
            let socket = match UdpSocket::bind("0.0.0.0:0").await {
                Ok(s) => s,
                Err(_) => return,
            };
            let _ = socket.set_broadcast(true);
            let target: SocketAddr = format!("255.255.255.255:{}", DEFAULT_UDP_PORT)
                .parse()
                .unwrap();

            loop {
                let locked = *is_locked_flag.read().await;
                let payload = BeaconPayload {
                    magic: MAGIC_BEACON,
                    device_id: my_dev_id.clone(),
                    device_name: device_name.clone(),
                    project_id: my_proj_id,
                    tcp_port,
                    is_locked: locked,
                };

                if let Ok(bytes) = bincode::serialize(&payload) {
                    let _ = socket.send_to(&bytes, target).await;
                }

                tokio::time::sleep(Duration::from_secs(2)).await;
            }
        });
    }

    /// Spawns UDP listener on port 52425 to discover fellow workstations
    pub fn start_listener(&self) {
        let peers = Arc::clone(&self.peers);
        let my_dev_id = self.my_device_id.clone();
        let my_proj_id = self.my_project_id;

        tokio::spawn(async move {
            let socket = match UdpSocket::bind(format!("0.0.0.0:{}", DEFAULT_UDP_PORT)).await {
                Ok(s) => s,
                Err(_) => {
                    return;
                }
            };
            let _ = socket.set_broadcast(true);

            let mut buf = vec![0u8; 1024];
            loop {
                if let Ok((len, src)) = socket.recv_from(&mut buf).await {
                    if let Ok(payload) = bincode::deserialize::<BeaconPayload>(&buf[..len]) {
                        if payload.magic == MAGIC_BEACON
                            && payload.device_id != my_dev_id
                            && payload.project_id == my_proj_id
                        {
                            let now = SystemTime::now()
                                .duration_since(UNIX_EPOCH)
                                .map(|d| d.as_secs())
                                .unwrap_or(0);

                            let peer = PeerInfo {
                                device_id: payload.device_id.clone(),
                                device_name: payload.device_name,
                                project_id: payload.project_id,
                                tcp_port: payload.tcp_port,
                                ip_addr: src.ip().to_string(),
                                is_locked: payload.is_locked,
                                last_seen_epoch_secs: now,
                            };

                            peers.write().await.insert(payload.device_id, peer);
                        }
                    }
                }
            }
        });
    }
}
