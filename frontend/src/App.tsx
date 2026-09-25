import { useEffect, useState } from 'react';
import { api } from './api';
import { RepoStatusDto, ScanResultDto, SnapshotSummaryDto, PeerInfo, ScannedFileDto } from './types';
import { Header } from './components/Header';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { InteractiveTourSpotlight } from './components/InteractiveTourSpotlight';
import { AlertTriangle, CheckCircle2, FolderOpen } from 'lucide-react';

export function App() {
  const [projectPath, setProjectPath] = useState<string>(() => {
    return (
      localStorage.getItem('compsync_project_path') ||
      'c:/Users/Rynix/Documents/Adrian/Coding/CompSync'
    );
  });

  const [myDeviceName, setMyDeviceName] = useState<string>(() => {
    return localStorage.getItem('compsync_my_device_name') || 'PC-Studio-Utama';
  });

  const [status, setStatus] = useState<RepoStatusDto | null>(null);
  const [scanResult, setScanResult] = useState<ScanResultDto | null>(null);
  const [snapshots, setSnapshots] = useState<SnapshotSummaryDto[]>([]);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<ScannedFileDto | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotSummaryDto | null>(null);
  const [lastSyncInfo, setLastSyncInfo] = useState<{
    peerName: string;
    time: string;
    type: 'push' | 'pull';
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [creatingSnapshot, setCreatingSnapshot] = useState(false);
  const [syncingPeer, setSyncingPeer] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Non-intrusive Guided Tour state
  const [isGuideActive, setIsGuideActive] = useState(true);
  const [guideStep, setGuideStep] = useState(1);

  // Check if running in browser mock mode
  const isMockMode = typeof window !== 'undefined' && !('__TAURI_INTERNALS__' in window);

  const handleRenameMyDevice = (newName: string) => {
    setMyDeviceName(newName);
    localStorage.setItem('compsync_my_device_name', newName);
    setNotification(`Nama perangkat diubah menjadi: "${newName}"`);
    setTimeout(() => setNotification(null), 3000);
  };

  const refreshAll = async (pathOverride?: string) => {
    const activePath = pathOverride ?? projectPath;
    if (!activePath) return;

    setLoading(true);
    try {
      const s = await api.getStatus(activePath);
      setStatus(s);

      if (s.is_initialized) {
        const snaps = await api.getSnapshots(activePath);
        setSnapshots(snaps);

        const p = await api.getPeers();
        setPeers(p);

        // Preload scan in mock mode so user sees changed files immediately
        if (isMockMode && !scanResult) {
          const res = await api.scan(activePath);
          setScanResult(res);
          if (res.files.length > 0 && !selectedFile) {
            setSelectedFile(res.files[0]);
          }
        }
      } else {
        setSnapshots([]);
      }
    } catch (err: any) {
      console.error('Failed to get status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(async () => {
      try {
        const p = await api.getPeers();
        setPeers(p);
      } catch (_) {}
    }, 4000);
    return () => clearInterval(interval);
  }, [projectPath]);

  const handleSelectFolder = async () => {
    try {
      const selected = await api.selectFolder();
      if (selected) {
        setProjectPath(selected);
        localStorage.setItem('compsync_project_path', selected);
        setScanResult(null);
        setSelectedFile(null);
        setSelectedSnapshot(null);
        await refreshAll(selected);
        if (isGuideActive && guideStep === 1) {
          setGuideStep(2);
        }
      }
    } catch (err: any) {
      alert(`Gagal memilih folder: ${err}`);
    }
  };

  const handleOpenFolder = async (subPath?: string) => {
    try {
      const full = subPath ? `${projectPath}/${subPath}` : projectPath;
      await api.openFolder(full);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScan = async () => {
    if (!projectPath) return;
    setScanning(true);
    try {
      const res = await api.scan(projectPath);
      setScanResult(res);
      if (res.files.length > 0) {
        setSelectedFile(res.files[0]);
      }
      await refreshAll();
      if (isGuideActive && guideStep === 4) {
        setGuideStep(5);
      }
    } catch (err: any) {
      alert(`Gagal memindai: ${err}`);
    } finally {
      setScanning(false);
    }
  };

  const handleSnapshot = async (msg: string) => {
    if (!projectPath) return;
    setCreatingSnapshot(true);
    try {
      const snapId = await api.snapshot(projectPath, msg);
      setNotification(`Versi ${snapId.slice(0, 8)} berhasil disimpan!`);
      setTimeout(() => setNotification(null), 4000);
      await refreshAll();
      if (isGuideActive && guideStep === 5) {
        setGuideStep(6);
      }
    } catch (err: any) {
      alert(`Gagal menyimpan versi: ${err}`);
    } finally {
      setCreatingSnapshot(false);
    }
  };

  const handlePull = async (peer: PeerInfo) => {
    if (!projectPath) return;
    setSyncingPeer(peer.device_id);
    try {
      const snapId = await api.pullFromPeer(projectPath, peer.ip_addr, peer.tcp_port);
      setLastSyncInfo({
        peerName: peer.device_name,
        time: new Date().toLocaleTimeString(),
        type: 'pull',
      });
      setNotification(`Berhasil sinkronisasi (Tarik Versi) dari ${peer.device_name}!`);
      setTimeout(() => setNotification(null), 5000);
      await refreshAll();
    } catch (err: any) {
      alert(`Gagal sinkronisasi: ${err}`);
    } finally {
      setSyncingPeer(null);
    }
  };

  const handleInit = async () => {
    if (!projectPath) return;
    setLoading(true);
    try {
      await api.initProject(projectPath);
      setNotification('Repository CompSync berhasil diinisialisasi.');
      setTimeout(() => setNotification(null), 4000);
      await refreshAll();
      if (isGuideActive && guideStep === 1) {
        setGuideStep(2);
      }
    } catch (err: any) {
      alert(`Gagal inisialisasi: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateLock = () => {
    if (status?.aep_files?.[0]) {
      const current = status.aep_files[0].lock.is_locked;
      api.devToggleLock(!current);
      refreshAll();
    }
  };

  const handleSelectFile = (file: ScannedFileDto) => {
    setSelectedFile(file);
    setSelectedSnapshot(null);
  };

  const handleSelectSnapshot = (snap: SnapshotSummaryDto) => {
    setSelectedSnapshot(snap);
    setSelectedFile(null);
  };

  return (
    <div className="flex flex-col h-screen bg-studio-bg text-studio-text-primary font-sans overflow-hidden">
      {/* 1. Header (Simplified Sync & Identity Hub) */}
      <Header
        status={status}
        projectPath={projectPath}
        onRefresh={() => refreshAll()}
        onSelectFolder={handleSelectFolder}
        onOpenInExplorer={() => handleOpenFolder()}
        onToggleGuide={() => setIsGuideActive(!isGuideActive)}
        isGuideActive={isGuideActive}
        loading={loading}
        onSimulateLockToggle={handleSimulateLock}
        isMockMode={isMockMode}
        myDeviceName={myDeviceName}
        onRenameMyDevice={handleRenameMyDevice}
        peers={peers}
        onPull={handlePull}
        syncingPeer={syncingPeer}
        lastSyncInfo={lastSyncInfo}
      />

      {/* Global Notification Banner */}
      {notification && (
        <div className="bg-studio-blue text-white text-xs px-4 py-1.5 font-medium flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-200" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Main Content Area */}
      {status && !status.is_initialized ? (
        <div className="flex-1 flex items-center justify-center p-6 bg-studio-bg">
          <div className="bg-studio-surface border border-studio-border rounded-xl p-8 text-center max-w-lg shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-studio-card border border-studio-border flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-studio-text-primary">Folder Belum Terdaftar di CompSync</h2>
              <p className="text-xs text-studio-text-secondary mt-1 leading-relaxed">
                Folder <code className="text-studio-text-primary font-mono bg-studio-card px-1.5 py-0.5 rounded">{projectPath}</code> belum memiliki index versi CompSync.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={handleSelectFolder}
                className="px-4 py-2 rounded-lg bg-studio-card hover:bg-studio-cardHover border border-studio-border text-studio-text-secondary hover:text-studio-text-primary text-xs font-medium transition-colors flex items-center space-x-2"
              >
                <FolderOpen className="w-3.5 h-3.5 text-studio-text-muted" />
                <span>Pilih Folder Lain</span>
              </button>

              <button
                onClick={handleInit}
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-studio-blue hover:bg-studio-blue-hover text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Inisialisasi Folder Ini
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Left Column: Changes & History (~40%) */}
          <div className="col-span-5 h-full overflow-hidden">
            <LeftPanel
              scanResult={scanResult}
              snapshots={snapshots}
              onScan={handleScan}
              onSnapshot={handleSnapshot}
              scanning={scanning}
              creatingSnapshot={creatingSnapshot}
              selectedFile={selectedFile}
              onSelectFile={handleSelectFile}
              selectedSnapshotId={selectedSnapshot?.snapshot_id || null}
              onSelectSnapshot={handleSelectSnapshot}
              myDeviceName={myDeviceName}
            />
          </div>

          {/* Right Column: Asset Row & File/Snapshot Inspector (~60%) */}
          <div className="col-span-7 h-full overflow-hidden">
            <RightPanel
              projectPath={projectPath}
              status={status}
              onOpenFolder={handleOpenFolder}
              selectedFile={selectedFile}
              selectedSnapshot={selectedSnapshot}
              myDeviceName={myDeviceName}
            />
          </div>
        </div>
      )}

      {/* Floating Non-Intrusive Guided Spotlight */}
      {isGuideActive && (
        <InteractiveTourSpotlight
          currentStep={guideStep}
          onNext={() => setGuideStep((prev) => Math.min(prev + 1, 6))}
          onPrev={() => setGuideStep((prev) => Math.max(prev - 1, 1))}
          onClose={() => setIsGuideActive(false)}
        />
      )}
    </div>
  );
}
