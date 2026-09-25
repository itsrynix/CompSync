import { RepoStatusDto, ScanResultDto, SnapshotSummaryDto, PeerInfo } from './types';

async function callTauri<T>(cmd: string, args: Record<string, any> = {}): Promise<T> {
  if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<T>(cmd, args);
  }

  console.log(`[Browser Mock Mode] calling ${cmd}`, args);
  if (cmd === 'get_project_status') {
    return {
      is_initialized: true,
      project_id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      project_name: 'Main_Explainer_2026',
      aep_files: [
        {
          file_name: 'MainProject_v2.aep',
          canonical_path: 'MainProject_v2.aep',
          lock: {
            is_locked: false,
            process_name: null,
            process_id: null,
            is_after_effects: false,
          },
        },
      ],
      indexed_files_count: 384,
    } as T;
  }

  if (cmd === 'scan_project') {
    return {
      files: [
        { path: 'MainProject_v2.aep', size_mb: 14.2, state: 'Modified', hash_short: '84eb5974' },
        { path: 'Footage/Interview_CamA_4K.mov', size_mb: 12288.0, state: 'Cached', hash_short: '1f8b4a2e' },
        { path: 'Footage/Broll_Drone_Sunset.mov', size_mb: 4890.5, state: 'Cached', hash_short: '7c9e0112' },
        { path: 'Audio/VO_Final_Mixed.wav', size_mb: 85.0, state: 'Added', hash_short: 'ca978112' },
      ],
      total_files: 4,
      total_mb: 17277.7,
      cached_files: 2,
      hashed_files: 2,
      duration_ms: 12,
      throughput_gbps: 3.42,
    } as T;
  }

  if (cmd === 'get_snapshots') {
    return [
      {
        snapshot_id: 'a4f89cb12e34',
        message: 'Fixed audio desync and added lower-third animation',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        author_name: 'Studio Desktop',
        total_files: 384,
        total_mb: 46120.5,
      },
      {
        snapshot_id: '84eb5974a064',
        message: 'Rough cut assembly and raw footage ingest',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        author_name: 'Laptop-Adrian',
        total_files: 380,
        total_mb: 46020.0,
      },
    ] as T;
  }

  if (cmd === 'get_lan_peers') {
    return [
      {
        device_id: 'laptop-adrian-99',
        device_name: 'Laptop-Adrian (MacBook Pro / Win)',
        project_id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        tcp_port: 52424,
        ip_addr: '192.168.1.108',
        is_locked: false,
        last_seen_epoch_secs: Math.floor(Date.now() / 1000),
      },
    ] as T;
  }

  return {} as T;
}

export const api = {
  getStatus: (path: string) => callTauri<RepoStatusDto>('get_project_status', { path }),
  initProject: (path: string) => callTauri<string>('init_project', { path }),
  scan: (path: string) => callTauri<ScanResultDto>('scan_project', { path }),
  snapshot: (path: string, message: string) => callTauri<string>('create_snapshot', { path, message }),
  getSnapshots: (path: string) => callTauri<SnapshotSummaryDto[]>('get_snapshots', { path }),
  getPeers: () => callTauri<PeerInfo[]>('get_lan_peers'),
  pullFromPeer: (path: string, peerIp: string, peerPort: number) =>
    callTauri<string>('pull_from_peer', { path, peerIp, peerPort }),
};
