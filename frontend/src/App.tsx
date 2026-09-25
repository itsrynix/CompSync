import { useEffect, useState } from 'react';
import { api } from './api';
import { RepoStatusDto, ScanResultDto, SnapshotSummaryDto, PeerInfo } from './types';
import { Header } from './components/Header';
import { RadarPeers } from './components/RadarPeers';
import { ScanPanel } from './components/ScanPanel';
import { Timeline } from './components/Timeline';
import { AlertTriangle } from 'lucide-react';

export function App() {
  const [projectPath] = useState<string>('c:/Users/Rynix/Documents/Adrian/Coding/CompSync');
  const [status, setStatus] = useState<RepoStatusDto | null>(null);
  const [scanResult, setScanResult] = useState<ScanResultDto | null>(null);
  const [snapshots, setSnapshots] = useState<SnapshotSummaryDto[]>([]);
  const [peers, setPeers] = useState<PeerInfo[]>([]);

  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [creatingSnapshot, setCreatingSnapshot] = useState(false);
  const [syncingPeer, setSyncingPeer] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const s = await api.getStatus(projectPath);
      setStatus(s);

      if (s.is_initialized) {
        const snaps = await api.getSnapshots(projectPath);
        setSnapshots(snaps);

        const p = await api.getPeers();
        setPeers(p);
      }
    } catch (err: any) {
      console.error(err);
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

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await api.scan(projectPath);
      setScanResult(res);
      await refreshAll();
    } catch (err: any) {
      alert(`Scan failed: ${err}`);
    } finally {
      setScanning(false);
    }
  };

  const handleSnapshot = async (msg: string) => {
    setCreatingSnapshot(true);
    try {
      const snapId = await api.snapshot(projectPath, msg);
      setNotification(`Snapshot ${snapId.slice(0, 8)} recorded successfully!`);
      setTimeout(() => setNotification(null), 4000);
      await refreshAll();
    } catch (err: any) {
      alert(`Snapshot failed: ${err}`);
    } finally {
      setCreatingSnapshot(false);
    }
  };

  const handlePull = async (peer: PeerInfo) => {
    setSyncingPeer(peer.device_id);
    try {
      const snapId = await api.pullFromPeer(projectPath, peer.ip_addr, peer.tcp_port);
      setNotification(`Synchronized successfully with ${peer.device_name}! (Head: ${snapId.slice(0, 8)})`);
      setTimeout(() => setNotification(null), 5000);
      await refreshAll();
    } catch (err: any) {
      alert(`Sync failed: ${err}`);
    } finally {
      setSyncingPeer(null);
    }
  };

  const handleInit = async () => {
    setLoading(true);
    try {
      await api.initProject(projectPath);
      await refreshAll();
    } catch (err: any) {
      alert(`Init failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-studio-bg text-gray-100 font-sans">
      <Header
        status={status}
        projectPath={projectPath}
        onRefresh={refreshAll}
        loading={loading}
      />

      {notification && (
        <div className="bg-indigo-600 text-white text-xs px-4 py-2 font-medium flex items-center justify-between shadow-lg">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-white/70 hover:text-white">✕</button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {status && !status.is_initialized ? (
          <div className="bg-studio-surface border border-studio-border rounded-2xl p-8 text-center max-w-lg mx-auto mt-12 shadow-xl">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h2 className="text-base font-bold text-white mb-1">Uninitialized Project</h2>
            <p className="text-xs text-gray-400 mb-6">
              CompSync has not been initialized for this directory yet. Initializing creates the internal version control database and automatic After Effects ignore rules.
            </p>
            <button
              onClick={handleInit}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Initialize CompSync Repository
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
            <div className="col-span-7 space-y-6">
              <RadarPeers
                peers={peers}
                onPull={handlePull}
                syncingPeer={syncingPeer}
              />
              <ScanPanel
                scanResult={scanResult}
                onScan={handleScan}
                scanning={scanning}
              />
            </div>

            <div className="col-span-5 space-y-6">
              <Timeline
                snapshots={snapshots}
                onSnapshot={handleSnapshot}
                creating={creatingSnapshot}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
