import { useEffect, useState, useRef } from 'react';
import { api } from './api';
import { RepoStatusDto, ScanResultDto, SnapshotSummaryDto, PeerInfo, ScannedFileDto, PairingInfo, SyncProgress } from './types';
import { TopBar, ProjectItem } from './components/TopBar';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { InteractiveTourSpotlight } from './components/InteractiveTourSpotlight';
import { ThemeSettingsModal, applyThemeToDom } from './components/ThemeSettingsModal';
import { PairingModal } from './components/PairingModal';
import { ProjectSetupModal } from './components/ProjectSetupModal';
import { AlertTriangle, CheckCircle2, FolderOpen, X } from 'lucide-react';
import { Language } from './i18n';

export function App() {
  const [projectPath, setProjectPath] = useState<string>(() => {
    return (
      localStorage.getItem('compsync_project_path') ||
      'c:/Users/Rynix/Documents/Adrian/Coding/CompSync'
    );
  });

  const [projectList, setProjectList] = useState<ProjectItem[]>(() => {
    const saved = localStorage.getItem('compsync_project_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return [
      {
        name: 'Commercial_AE_2026',
        path: 'D:/Studio_Projects/Commercial_AE_2026',
      },
      {
        name: 'Explainer_Promo',
        path: 'C:/Users/Rynix/Videos/AfterEffects/Explainer_Promo',
      },
      {
        name: 'CompSync (Repo)',
        path: 'c:/Users/Rynix/Documents/Adrian/Coding/CompSync',
      },
    ];
  });

  const [myDeviceName, setMyDeviceName] = useState<string>(() => {
    return localStorage.getItem('compsync_my_device_name') || 'PC-Studio-Utama';
  });

  // Language state (English default)
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('compsync_language') as Language) || 'en';
  });

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('compsync_language', lang);
  };

  // Theme & Appearance state
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    return localStorage.getItem('compsync_theme_id') || 'ae-default';
  });
  const [selectedAccentId, setSelectedAccentId] = useState<string>(() => {
    return localStorage.getItem('compsync_accent_id') || 'adobe-blue';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    applyThemeToDom(selectedThemeId, selectedAccentId);
  }, [selectedThemeId, selectedAccentId]);

  const handleSelectTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
    localStorage.setItem('compsync_theme_id', themeId);
  };

  const handleSelectAccent = (accentId: string) => {
    setSelectedAccentId(accentId);
    localStorage.setItem('compsync_accent_id', accentId);
  };

  const [status, setStatus] = useState<RepoStatusDto | null>(null);
  const [pairingInfo, setPairingInfo] = useState<PairingInfo | null>(null);
  const [isPairingOpen, setIsPairingOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [setupPath, setSetupPath] = useState(projectPath);
  const [initMode, setInitMode] = useState<'choice' | 'create' | 'join'>('choice');
  const [pairingCode, setPairingCode] = useState('');
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
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [syncCancelRequested, setSyncCancelRequested] = useState(false);

  // Robust notification system with timer reset and key remount
  const [notification, setNotification] = useState<{ id: number; message: string } | null>(null);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerNotification = (message: string, durationMs: number = 3500) => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
      notificationTimerRef.current = null;
    }
    const newId = Date.now();
    setNotification({ id: newId, message });
    notificationTimerRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimerRef.current = null;
    }, durationMs);
  };

  const dismissNotification = () => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
      notificationTimerRef.current = null;
    }
    setNotification(null);
  };

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, []);

  // Stretchable sidebar width state
  const [leftWidth, setLeftWidth] = useState<number>(() => {
    const saved = localStorage.getItem('compsync_left_panel_width');
    return saved ? Math.max(260, Math.min(800, parseInt(saved, 10))) : 360;
  });
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);

  const handleMouseDownDivider = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingDivider(true);
    const startX = e.clientX;
    const startWidth = leftWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(
        260,
        Math.min(window.innerWidth * 0.65, startWidth + (moveEvent.clientX - startX))
      );
      setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDraggingDivider(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setLeftWidth((w) => {
        localStorage.setItem('compsync_left_panel_width', w.toString());
        return w;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Non-intrusive Guided Tour state
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [guideStep, setGuideStep] = useState(1);

  // Check if running in browser mock mode
  const isMockMode = typeof window !== 'undefined' && !('__TAURI_INTERNALS__' in window);

  useEffect(() => {
    if (isMockMode) return;

    let unlisten: (() => void) | undefined;
    import('@tauri-apps/api/event').then(({ listen }) => {
      listen<SyncProgress>('sync-progress', (event) => {
        setSyncProgress(event.payload);
      }).then((removeListener) => {
        unlisten = removeListener;
      });
    });

    return () => unlisten?.();
  }, [isMockMode]);

  const handleRenameMyDevice = (newName: string) => {
    setMyDeviceName(newName);
    localStorage.setItem('compsync_my_device_name', newName);
    triggerNotification(
      language === 'id' ? `Nama perangkat diubah: "${newName}"` : `Device renamed to: "${newName}"`,
      3000
    );
  };

  const refreshAll = async (pathOverride?: string) => {
    const activePath = pathOverride ?? projectPath;
    if (!activePath) return;

    setLoading(true);
    try {
      const s = await api.getStatus(activePath);
      setStatus(s);

      if (s.is_initialized) {
        const pairing = await api.getPairingInfo(activePath);
        setPairingInfo(pairing);
        const snaps = await api.getSnapshots(activePath);
        setSnapshots(snaps);

        const p = await api.getPeers();
        setPeers(p);

        const res = await api.scan(activePath);
        setScanResult(res);
        if (res.files.length > 0 && !selectedFile) {
          setSelectedFile(res.files[0]);
        }
      } else {
        setPairingInfo(null);
        setSnapshots([]);
        setPeers([]);
        setScanResult(null);
      }
    } catch (err: any) {
      console.error('Failed to refresh repo state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, [projectPath]);

  const handleSwitchProject = (newPath: string) => {
    if (newPath === projectPath) return;
    setProjectPath(newPath);
    localStorage.setItem('compsync_project_path', newPath);
    setSelectedFile(null);
    setSelectedSnapshot(null);
    setScanResult(null);
    setInitMode('choice');
    setPairingCode('');
  };

  const handleAddNewProject = async () => {
    const promptMsg =
      language === 'id'
        ? 'Masukkan path folder project After Effects baru (contoh: D:/Projects/Commercial_2026):'
        : 'Enter new After Effects project folder path (e.g. D:/Projects/Commercial_2026):';
    const folder = prompt(promptMsg);
    if (!folder) return;

    const trimmed = folder.trim().replace(/\\/g, '/');
    const folderName = trimmed.split('/').filter(Boolean).pop() || trimmed;

    const exists = projectList.some(
      (p) => p.path.toLowerCase() === trimmed.toLowerCase()
    );

    if (!exists) {
      const updated = [...projectList, { name: folderName, path: trimmed }];
      setProjectList(updated);
      localStorage.setItem('compsync_project_list', JSON.stringify(updated));
    }

    handleSwitchProject(trimmed);
  };

  const rememberProject = (path: string) => {
    const normalizedPath = path.replace(/\\/g, '/');
    const name = normalizedPath.split('/').filter(Boolean).pop() || normalizedPath;
    if (!projectList.some((project) => project.path.toLowerCase() === normalizedPath.toLowerCase())) {
      const updated = [...projectList, { name, path: normalizedPath }];
      setProjectList(updated);
      localStorage.setItem('compsync_project_list', JSON.stringify(updated));
    }
    return normalizedPath;
  };

  const handleSetupSelectFolder = async () => {
    const selected = await api.selectFolder();
    if (selected) setSetupPath(selected.replace(/\\/g, '/'));
  };

  const handleSetupCreate = async (path: string) => {
    const normalizedPath = rememberProject(path);
    await api.initProject(normalizedPath);
    setIsSetupOpen(false);
    setProjectPath(normalizedPath);
    localStorage.setItem('compsync_project_path', normalizedPath);
    await refreshAll(normalizedPath);
    triggerNotification(language === 'id' ? 'Project berhasil dibuat.' : 'Project created successfully.', 3500);
  };

  const handleSetupJoin = async (path: string, code: string) => {
    const normalizedPath = rememberProject(path);
    await api.joinProject(normalizedPath, code);
    setIsSetupOpen(false);
    setProjectPath(normalizedPath);
    localStorage.setItem('compsync_project_path', normalizedPath);
    await refreshAll(normalizedPath);
    triggerNotification(language === 'id' ? 'Project berhasil di-link.' : 'Project linked successfully.', 3500);
  };

  const handleJoinExistingProject = async () => {
    const code = prompt(
      language === 'id'
        ? 'Masukkan pairing code dari komputer utama:'
        : 'Enter the pairing code from the primary computer:'
    );
    if (!code?.trim()) return;

    const folder = await api.selectFolder();
    if (!folder) return;

    const normalizedPath = folder.replace(/\\/g, '/');
    setLoading(true);
    try {
      await api.joinProject(normalizedPath, code.trim());
      handleSwitchProject(normalizedPath);
      triggerNotification(
        language === 'id'
          ? 'Folder berhasil dipasangkan ke project.'
          : 'Folder joined to the project successfully.',
        4000
      );
      await refreshAll(normalizedPath);
    } catch (err: any) {
      alert(`Join failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFolderByPath = (targetPath: string) => {
    api.openFolder(targetPath);
  };

  const handleOpenFolder = (subPath?: string) => {
    const isAbsolute = Boolean(subPath && /^[A-Za-z]:[\\/]/.test(subPath));
    const full = subPath && isAbsolute ? subPath : subPath ? `${projectPath}/${subPath}` : projectPath;
    api.openFolder(full);
  };

  const handleScan = async () => {
    if (!projectPath) return;
    setScanning(true);
    try {
      const res = await api.scan(projectPath);
      setScanResult(res);
      triggerNotification(
        language === 'id'
          ? `Pemindaian selesai: ${res.files.length} file terdeteksi.`
          : `Scan complete: ${res.files.length} files detected.`,
        3500
      );
      if (isGuideActive && guideStep === 3) {
        setGuideStep(4);
      }
    } catch (err: any) {
      alert(`Scan failed: ${err}`);
    } finally {
      setScanning(false);
    }
  };

  const handleSnapshot = async (message: string) => {
    if (!projectPath) return;
    const confirmed = window.confirm(
      language === 'id'
        ? `Buat snapshot dengan pesan ini?\n\n${message}\n\nSnapshot tidak dapat diedit setelah dibuat.`
        : `Create a snapshot with this message?\n\n${message}\n\nSnapshots cannot be edited after creation.`
    );
    if (!confirmed) return;
    setCreatingSnapshot(true);
    try {
      const snapshotId = await api.snapshot(projectPath, message);
      triggerNotification(
        language === 'id'
          ? `Snapshot #${snapshotId.slice(0, 8)} berhasil dibuat!`
          : `Snapshot #${snapshotId.slice(0, 8)} committed successfully!`,
        4000
      );
      await refreshAll();
      if (isGuideActive && guideStep === 4) {
        setGuideStep(5);
      }
    } catch (err: any) {
      alert(`Failed to commit snapshot: ${err}`);
    } finally {
      setCreatingSnapshot(false);
    }
  };

  const handlePull = async (peer: PeerInfo) => {
    if (!projectPath) return;
    setSyncingPeer(peer.device_id);
    setSyncCancelRequested(false);
    setSyncProgress({
      phase: 'Preparing',
      total_bytes: 0,
      transferred_bytes: 0,
      total_chunks: 0,
      completed_chunks: 0,
      current_file: '',
      current_file_index: 0,
      total_files: 0,
      speed_mbps: 0,
      is_finished: false,
    });
    try {
      await api.pullFromPeer(projectPath, peer.ip_addr, peer.tcp_port);
      setLastSyncInfo({
        peerName: peer.device_name,
        time: new Date().toLocaleTimeString(),
        type: 'pull',
      });
      triggerNotification(
        language === 'id'
          ? `Berhasil sinkronisasi dari ${peer.device_name}!`
          : `Successfully pulled latest revisions from ${peer.device_name}!`,
        5000
      );
      await refreshAll();
    } catch (err: any) {
      if (syncCancelRequested || String(err).toLowerCase().includes('cancel')) {
        setSyncProgress((current) => current ? { ...current, phase: 'Cancelled', is_finished: true } : current);
        triggerNotification(
          language === 'id' ? 'Sinkronisasi dibatalkan.' : 'Sync cancelled.',
          3500
        );
      } else {
        alert(`Sync failed: ${err}`);
      }
    } finally {
      setSyncingPeer(null);
      setSyncCancelRequested(false);
    }
  };

  const handleCancelSync = async () => {
    if (!syncingPeer || syncCancelRequested) return;
    setSyncCancelRequested(true);
    setSyncProgress((current) => current ? { ...current, phase: 'Cancelling' } : current);
    try {
      await api.cancelSync();
    } catch (err) {
      setSyncCancelRequested(false);
      console.error('Failed to cancel sync:', err);
    }
  };

  const handleInit = async () => {
    if (!projectPath) return;
    setLoading(true);
    try {
      await api.initProject(projectPath);
      triggerNotification(
        language === 'id'
          ? 'Repository CompSync berhasil diinisialisasi.'
          : 'CompSync repository initialized successfully.',
        4000
      );
      await refreshAll();
      if (isGuideActive && guideStep === 1) {
        setGuideStep(2);
      }
    } catch (err: any) {
      alert(`Init failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!projectPath || !pairingCode.trim()) return;
    setLoading(true);
    try {
      await api.joinProject(projectPath, pairingCode.trim());
      triggerNotification(
        language === 'id'
          ? 'Folder berhasil dipasangkan ke project.'
          : 'Folder joined to the project successfully.',
        4000
      );
      setInitMode('choice');
      setPairingCode('');
      await refreshAll();
    } catch (err: any) {
      alert(`Join failed: ${err}`);
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
      {/* 1. TopBar (Unified Project Dropdown + Device Sync Hub + Icon Settings) */}
      <TopBar
        status={status}
        projectPath={projectPath}
        onRefresh={() => refreshAll()}
        onToggleGuide={() => { setGuideStep(1); setIsGuideActive(!isGuideActive); }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPairing={() => setIsPairingOpen(true)}
        isGuideActive={isGuideActive}
        loading={loading}
        onSimulateLockToggle={handleSimulateLock}
        isMockMode={isMockMode}
        projectList={projectList}
        onSwitchProject={handleSwitchProject}
        onOpenSetup={() => { setSetupPath(projectPath); setIsSetupOpen(true); }}
        onOpenFolderByPath={handleOpenFolderByPath}
        myDeviceName={myDeviceName}
        onRenameMyDevice={handleRenameMyDevice}
        peers={peers}
        onPull={handlePull}
        syncingPeer={syncingPeer}
        lastSyncInfo={lastSyncInfo}
        leftWidth={leftWidth}
        language={language}
      />

      {/* Bottom-Right Toast Notification Pop-up with Spring Slide-in Animation & Fresh Timer Reset */}
      {notification && (
        <div
          key={notification.id}
          className="fixed bottom-6 right-6 z-50 max-w-md bg-studio-surface border border-studio-border rounded-xl shadow-2xl p-3.5 flex items-center justify-between space-x-3 text-xs animate-toast backdrop-blur-md"
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-studio-blue/20 border border-studio-blue/40 flex items-center justify-center text-studio-blue-light flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-gray-100 font-medium leading-snug">{notification.message}</span>
          </div>
          <button
            onClick={dismissNotification}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors flex-shrink-0"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {syncProgress && syncingPeer && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-6 backdrop-blur-[2px]">
          <div className="w-full max-w-xl rounded-xl border border-studio-border bg-studio-surface p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-studio-text-muted">{language === 'id' ? 'Sinkronisasi Project' : 'Project Sync'}</p>
                <h2 className="mt-1 text-base font-semibold text-studio-text-primary">
                  {syncProgress.phase === 'Cancelling' ? (language === 'id' ? 'Membatalkan...' : 'Cancelling...') : syncProgress.phase}
                </h2>
              </div>
              <span className="font-mono text-lg font-semibold text-studio-blue-light">
                {syncProgress.total_bytes > 0 ? `${Math.min(100, Math.round((syncProgress.transferred_bytes / syncProgress.total_bytes) * 100))}%` : '0%'}
              </span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-studio-bg">
              <div
                className="h-full rounded-full bg-studio-blue transition-[width] duration-300"
                style={{ width: `${syncProgress.total_bytes > 0 ? Math.min(100, (syncProgress.transferred_bytes / syncProgress.total_bytes) * 100) : 0}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="min-w-0 rounded-lg border border-studio-border bg-studio-bg p-3">
                <p className="text-[10px] uppercase tracking-wide text-studio-text-muted">{language === 'id' ? 'File aktif' : 'Current file'}</p>
                <p className="mt-1 truncate font-medium text-studio-text-primary">{syncProgress.current_file || (language === 'id' ? 'Menyiapkan koneksi...' : 'Preparing connection...')}</p>
                <p className="mt-1 text-[10px] text-studio-text-muted">{syncProgress.current_file_index} / {syncProgress.total_files || '-'} files</p>
              </div>
              <div className="rounded-lg border border-studio-border bg-studio-bg p-3">
                <p className="text-[10px] uppercase tracking-wide text-studio-text-muted">{language === 'id' ? 'Transfer' : 'Transfer'}</p>
                <p className="mt-1 font-medium text-studio-text-primary">{(syncProgress.transferred_bytes / (1024 * 1024)).toFixed(1)} MB / {(syncProgress.total_bytes / (1024 * 1024)).toFixed(1)} MB</p>
                <p className="mt-1 text-[10px] text-studio-text-muted">{syncProgress.speed_mbps.toFixed(1)} MB/s</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={handleCancelSync}
                disabled={syncCancelRequested}
                className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {syncCancelRequested ? (language === 'id' ? 'Membatalkan...' : 'Cancelling...') : language === 'id' ? 'Batalkan Sync' : 'Cancel Sync'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Content Area */}
      {status && !status.is_initialized ? (
        <div className="flex-1 flex items-center justify-center p-6 bg-studio-bg">
          <div className="bg-studio-surface border border-studio-border rounded-xl p-8 text-center max-w-lg shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-studio-card border border-studio-border flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            {initMode === 'choice' && <div>
              <h2 className="text-sm font-bold text-studio-text-primary">
                {language === 'id' ? 'Siapkan Folder Project' : 'Set Up This Project Folder'}
              </h2>
              <p className="text-xs text-studio-text-secondary mt-1 leading-relaxed">
                {language === 'id' ? 'Buat project baru atau pasangkan folder ini ke project yang sudah ada.' : 'Create a new project or join this folder to an existing project.'}
              </p>
            </div>}

            {initMode === 'choice' && <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setInitMode('create')}
                className="rounded-lg border border-studio-blue-border bg-studio-blue/15 px-4 py-3 text-left text-xs font-semibold text-studio-blue-light transition-colors hover:bg-studio-blue/25"
              >
                {language === 'id' ? 'Buat Project Baru' : 'Create New Project'}
                <span className="mt-1 block text-[10px] font-normal text-studio-text-muted">
                  {language === 'id' ? 'Buat ID project baru.' : 'Generate a new project ID.'}
                </span>
              </button>
              <button
                onClick={() => setInitMode('join')}
                className="rounded-lg border border-studio-border bg-studio-card px-4 py-3 text-left text-xs font-semibold text-studio-text-primary transition-colors hover:bg-studio-cardHover"
              >
                {language === 'id' ? 'Gabung Project' : 'Join Existing Project'}
                <span className="mt-1 block text-[10px] font-normal text-studio-text-muted">
                  {language === 'id' ? 'Gunakan pairing code.' : 'Use a pairing code.'}
                </span>
              </button>
            </div>}

            {initMode === 'create' && <div className="space-y-3 pt-2">
              <p className="text-xs text-studio-text-secondary">
                {language === 'id' ? 'Folder ini akan menjadi project utama dan mendapat pairing code baru.' : 'This folder will become the primary project and receive a new pairing code.'}
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setInitMode('choice')} className="rounded-lg border border-studio-border px-4 py-2 text-xs text-studio-text-secondary hover:bg-studio-card">
                  {language === 'id' ? 'Kembali' : 'Back'}
                </button>
                <button onClick={handleInit} disabled={loading} className="rounded-lg bg-studio-blue px-5 py-2 text-xs font-semibold text-white hover:bg-studio-blue-hover disabled:opacity-50">
                  {loading ? (language === 'id' ? 'Menyiapkan...' : 'Setting up...') : language === 'id' ? 'Buat Project' : 'Create Project'}
                </button>
              </div>
            </div>}

            {initMode === 'join' && <form onSubmit={(event) => { event.preventDefault(); handleJoin(); }} className="space-y-3 pt-2 text-left">
              <label className="block text-[11px] font-medium text-studio-text-secondary">
                {language === 'id' ? 'Pairing code / Project ID' : 'Pairing code / Project ID'}
                <input
                  value={pairingCode}
                  onChange={(event) => setPairingCode(event.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="mt-1 w-full rounded-lg border border-studio-border bg-studio-bg px-3 py-2 font-mono text-xs text-studio-text-primary outline-none focus:border-studio-blue"
                  autoFocus
                />
              </label>
              <div className="flex justify-center gap-3">
                <button type="button" onClick={() => setInitMode('choice')} className="rounded-lg border border-studio-border px-4 py-2 text-xs text-studio-text-secondary hover:bg-studio-card">
                  {language === 'id' ? 'Kembali' : 'Back'}
                </button>
                <button type="submit" disabled={loading || !pairingCode.trim()} className="rounded-lg bg-studio-blue px-5 py-2 text-xs font-semibold text-white hover:bg-studio-blue-hover disabled:opacity-50">
                  {loading ? (language === 'id' ? 'Memasangkan...' : 'Joining...') : language === 'id' ? 'Pasangkan Folder' : 'Join Project'}
                </button>
              </div>
            </form>}
          </div>
        </div>
      ) : (
        <div className={`flex-1 flex overflow-hidden ${isDraggingDivider ? 'select-none cursor-col-resize' : ''}`}>
          {/* Stretchable Left Panel */}
          <div style={{ width: `${leftWidth}px` }} className="h-full flex-shrink-0 overflow-hidden">
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
              language={language}
            />
          </div>

          {/* Draggable Divider Splitter */}
          <div
            onMouseDown={handleMouseDownDivider}
            className={`w-px cursor-col-resize flex-shrink-0 transition-colors z-20 relative group ${
              isDraggingDivider
                ? 'bg-studio-blue'
                : 'bg-studio-border hover:bg-studio-blue'
            }`}
            title="Drag to resize sidebar"
          >
            {/* Invisible 16px grab hit area */}
            <div className="absolute inset-y-0 -left-1.5 right-0 cursor-col-resize z-10" />
          </div>

          {/* Right Panel */}
          <div className="flex-1 h-full overflow-hidden">
            <RightPanel
              projectPath={projectPath}
              status={status}
              onOpenFolder={handleOpenFolder}
              selectedFile={selectedFile}
              selectedSnapshot={selectedSnapshot}
              myDeviceName={myDeviceName}
              scanResult={scanResult}
              onSelectFile={handleSelectFile}
              onCloseDetail={() => {
                setSelectedFile(null);
                setSelectedSnapshot(null);
              }}
              language={language}
            />
          </div>
        </div>
      )}

      {/* Theme & General Settings Modal */}
      <ThemeSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedThemeId={selectedThemeId}
        selectedAccentId={selectedAccentId}
        onSelectTheme={handleSelectTheme}
        onSelectAccent={handleSelectAccent}
        language={language}
        onSelectLanguage={handleSelectLanguage}
        deviceName={myDeviceName}
        onRenameDevice={handleRenameMyDevice}
      />

      <PairingModal
        isOpen={isPairingOpen}
        onClose={() => setIsPairingOpen(false)}
        pairingInfo={pairingInfo}
        language={language}
      />

      <ProjectSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        language={language}
        selectedPath={setupPath}
        onSelectFolder={handleSetupSelectFolder}
        onCreate={handleSetupCreate}
        onJoin={handleSetupJoin}
      />

      {/* Floating Non-Intrusive Guided Spotlight */}
      {isGuideActive && (
        <InteractiveTourSpotlight
          currentStep={guideStep}
          onNext={() => setGuideStep((prev) => Math.min(prev + 1, 6))}
          onPrev={() => setGuideStep((prev) => Math.max(prev - 1, 1))}
          onClose={() => setIsGuideActive(false)}
          language={language}
        />
      )}
    </div>
  );
}
