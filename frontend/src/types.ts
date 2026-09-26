export interface LockInfo {
  is_locked: boolean;
  process_name: string | null;
  process_id: number | null;
  is_after_effects: boolean;
}

export interface AepFileStatus {
  file_name: string;
  canonical_path: string;
  lock: LockInfo;
}

export interface RepoStatusDto {
  is_initialized: boolean;
  project_id: string | null;
  project_name: string | null;
  aep_files: AepFileStatus[];
  indexed_files_count: number;
}

export interface ScannedFileDto {
  path: string;
  absolute_path?: string;
  size_mb: number;
  state: 'Added' | 'Modified' | 'Cached' | 'Baru' | 'Diubah' | 'Tersimpan' | 'Hilang' | 'Missing' | 'Konflik';
  hash_short: string;
}

export interface ScanResultDto {
  files: ScannedFileDto[];
  total_files: number;
  total_mb: number;
  cached_files: number;
  hashed_files: number;
  duration_ms: number;
  throughput_gbps: number;
}

export interface SnapshotSummaryDto {
  snapshot_id: string;
  message: string;
  created_at: string;
  author_name: string;
  total_files: number;
  total_mb: number;
}

export interface PeerInfo {
  device_id: string;
  device_name: string;
  project_id: string;
  tcp_port: number;
  ip_addr: string;
  is_locked: boolean;
  last_seen_epoch_secs: number;
}

export interface PairingInfo {
  project_id: string;
  project_name: string;
  pairing_code: string;
}

export interface SyncProgress {
  phase: string;
  total_bytes: number;
  transferred_bytes: number;
  total_chunks: number;
  completed_chunks: number;
  current_file: string;
  current_file_index: number;
  total_files: number;
  speed_mbps: number;
  is_finished: boolean;
}
