import { RepoStatusDto, ScanResultDto, SnapshotSummaryDto, PeerInfo } from './types';

// Mock storage for local browser development
let mockStatus: RepoStatusDto = {
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
};

let mockScanResult: ScanResultDto = {
  files: [
    { path: 'MainProject_v2.aep', size_mb: 14.2, state: 'Diubah', hash_short: '84eb5974' },
    { path: 'Footage/Interview_CamA_4K.mov', size_mb: 12288.0, state: 'Tersimpan', hash_short: '1f8b4a2e' },
    { path: 'Footage/Broll_Drone_Sunset.mov', size_mb: 4890.5, state: 'Tersimpan', hash_short: '7c9e0112' },
    { path: 'Audio/VO_Final_Mixed.wav', size_mb: 85.0, state: 'Baru', hash_short: 'ca978112' },
    { path: 'Graphics/LowerThird_Title.mogrt', size_mb: 24.5, state: 'Baru', hash_short: '99ab4102' },
  ],
  total_files: 5,
  total_mb: 17302.2,
  cached_files: 2,
  hashed_files: 3,
  duration_ms: 18,
  throughput_gbps: 3.42,
};

let mockSnapshots: SnapshotSummaryDto[] = [
  {
    snapshot_id: 'a4f89cb12e34',
    message: 'Perbaikan desync audio dan penambahan lower-third',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    author_name: 'Studio Desktop',
    total_files: 384,
    total_mb: 46120.5,
  },
  {
    snapshot_id: '84eb5974a064',
    message: 'Rough cut awal dan import footage 4K Cam A',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    author_name: 'Laptop-Adrian',
    total_files: 380,
    total_mb: 46020.0,
  },
];

let mockPeers: PeerInfo[] = [
  {
    device_id: 'laptop-adrian-99',
    device_name: 'Laptop-Adrian (MacBook / Win)',
    project_id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    tcp_port: 52424,
    ip_addr: '192.168.1.108',
    is_locked: false,
    last_seen_epoch_secs: Math.floor(Date.now() / 1000),
  },
];

async function callTauri<T>(cmd: string, args: Record<string, any> = {}): Promise<T> {
  if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<T>(cmd, args);
  }

  console.log(`[Browser Mock Mode] calling ${cmd}`, args);
  if (cmd === 'get_project_status') {
    return mockStatus as T;
  }

  if (cmd === 'select_folder') {
    const demoFolders = [
      'D:/Studio_Projects/Commercial_AE_2026',
      'C:/Users/Rynix/Videos/AfterEffects/Explainer_Promo',
      'E:/Client_Footage/Nike_Motion_Reel',
    ];
    const picked = demoFolders[Math.floor(Math.random() * demoFolders.length)];
    mockStatus.project_name = picked.split('/').pop() || 'AE_Project';
    return picked as T;
  }

  if (cmd === 'open_folder') {
    alert(`[Simulasi Browser] Membuka folder di Windows Explorer: ${args.path}`);
    return {} as T;
  }

  if (cmd === 'scan_project') {
    return mockScanResult as T;
  }

  if (cmd === 'create_snapshot') {
    const newSnap: SnapshotSummaryDto = {
      snapshot_id: Math.random().toString(36).substring(2, 10),
      message: args.message,
      created_at: new Date().toISOString(),
      author_name: 'Studio Workstation',
      total_files: 385,
      total_mb: 46145.0,
    };
    mockSnapshots = [newSnap, ...mockSnapshots];
    return newSnap.snapshot_id as T;
  }

  if (cmd === 'get_snapshots') {
    return mockSnapshots as T;
  }

  if (cmd === 'get_lan_peers') {
    return mockPeers as T;
  }

  if (cmd === 'pull_from_peer') {
    return 'c84a10f9' as T;
  }

  return {} as T;
}

export const api = {
  selectFolder: () => callTauri<string | null>('select_folder'),
  openFolder: (path: string) => callTauri<void>('open_folder', { path }),
  getStatus: (path: string) => callTauri<RepoStatusDto>('get_project_status', { path }),
  initProject: (path: string) => callTauri<string>('init_project', { path }),
  scan: (path: string) => callTauri<ScanResultDto>('scan_project', { path }),
  snapshot: (path: string, message: string) => callTauri<string>('create_snapshot', { path, message }),
  getSnapshots: (path: string) => callTauri<SnapshotSummaryDto[]>('get_snapshots', { path }),
  getPeers: () => callTauri<PeerInfo[]>('get_lan_peers'),
  pullFromPeer: (path: string, peerIp: string, peerPort: number) =>
    callTauri<string>('pull_from_peer', { path, peerIp, peerPort }),
  
  // Dev Helper for Browser Testing
  devToggleLock: (isLocked: boolean) => {
    if (mockStatus.aep_files[0]) {
      mockStatus.aep_files[0].lock.is_locked = isLocked;
      mockStatus.aep_files[0].lock.process_name = isLocked ? 'AfterFX.exe' : null;
      mockStatus.aep_files[0].lock.process_id = isLocked ? 18420 : null;
    }
  },
};
