import React, { useState } from 'react';
import { RepoStatusDto, PeerInfo } from '../types';
import {
  FolderGit2,
  ExternalLink,
  RefreshCw,
  HelpCircle,
  Laptop,
  ArrowDownLeft,
  Edit2,
  Check,
  X,
  ChevronDown,
  Plus,
  Folder,
  Settings,
} from 'lucide-react';

export interface ProjectItem {
  name: string;
  path: string;
}

interface Props {
  status: RepoStatusDto | null;
  projectPath: string;
  onRefresh: () => void;
  onToggleGuide: () => void;
  onOpenSettings: () => void;
  isGuideActive: boolean;
  loading: boolean;
  onSimulateLockToggle?: () => void;
  isMockMode?: boolean;
  // Project list & dropdown
  projectList: ProjectItem[];
  onSwitchProject: (path: string) => void;
  onAddNewProject: () => void;
  onOpenFolderByPath: (path: string) => void;
  // Device Identity & Sync Hub
  myDeviceName: string;
  onRenameMyDevice: (newName: string) => void;
  peers: PeerInfo[];
  onPull: (peer: PeerInfo) => void;
  syncingPeer: string | null;
  lastSyncInfo: { peerName: string; time: string; type: 'push' | 'pull' } | null;
}

export const Header: React.FC<Props> = ({
  status,
  projectPath,
  onRefresh,
  onToggleGuide,
  onOpenSettings,
  isGuideActive,
  loading,
  onSimulateLockToggle,
  isMockMode,
  projectList,
  onSwitchProject,
  onAddNewProject,
  onOpenFolderByPath,
  myDeviceName,
  onRenameMyDevice,
  peers,
  onPull,
  syncingPeer,
  lastSyncInfo,
}) => {
  const [isEditingDeviceName, setIsEditingDeviceName] = useState(false);
  const [tempDeviceName, setTempDeviceName] = useState(myDeviceName);
  const [showPeerDropdown, setShowPeerDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const primaryAep = status?.aep_files?.[0];
  const isLocked = primaryAep?.lock.is_locked;
  const currentProjectName =
    status?.project_name ||
    projectPath.split('/').filter(Boolean).pop() ||
    projectPath.split('\\').filter(Boolean).pop() ||
    'Project After Effects';

  const activePeer = peers[0] || null;

  const handleSaveDeviceName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (tempDeviceName.trim()) {
      onRenameMyDevice(tempDeviceName.trim());
    }
    setIsEditingDeviceName(false);
  };

  return (
    <header className="bg-studio-surface border-b border-studio-border px-4 py-2 flex items-center justify-between select-none shadow-sm z-30 gap-3 relative">
      {/* Backdrop for open dropdowns */}
      {(showProjectDropdown || showPeerDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProjectDropdown(false);
            setShowPeerDropdown(false);
          }}
        />
      )}

      {/* 1. Left Cluster: Unified Project Selector Dropdown (GitHub Desktop Style) */}
      <div className="relative z-50 flex-shrink-0">
        <button
          onClick={() => {
            setShowProjectDropdown(!showProjectDropdown);
            setShowPeerDropdown(false);
          }}
          className={`flex items-center space-x-2 bg-studio-sidebar border rounded-md px-3 py-1.5 transition-all text-left group ${
            showProjectDropdown
              ? 'border-studio-blue bg-studio-card'
              : 'border-studio-border hover:bg-studio-card hover:border-studio-borderHover'
          }`}
          title="Pilih project atau integrasikan folder baru"
        >
          <FolderGit2 className="w-3.5 h-3.5 text-studio-blue-light flex-shrink-0" />
          <div className="flex flex-col text-left pr-1">
            <span className="text-[9px] text-studio-text-muted font-medium uppercase tracking-wider leading-none">
              Project Aktif
            </span>
            <span
              className="text-xs font-semibold text-studio-text-primary max-w-[170px] truncate leading-tight mt-0.5"
              title={currentProjectName}
            >
              {currentProjectName}
            </span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-studio-text-muted transition-transform duration-200 ${
              showProjectDropdown ? 'rotate-180 text-studio-blue-light' : 'group-hover:text-studio-text-secondary'
            }`}
          />
        </button>

        {/* Dropdown Menu for Integrated Projects */}
        {showProjectDropdown && (
          <div className="absolute top-full left-0 mt-1.5 w-80 bg-studio-surface border border-studio-border rounded-lg shadow-2xl z-50 overflow-hidden divide-y divide-studio-borderSubtle animate-fadeIn">
            {/* Dropdown Header */}
            <div className="px-3 py-2 bg-studio-sidebar/60 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-studio-text-muted tracking-wider">
                Folder Project Terintegrasi ({projectList.length})
              </span>
            </div>

            {/* Project List */}
            <div className="max-h-64 overflow-y-auto divide-y divide-studio-borderSubtle">
              {projectList.map((p) => {
                const isCurrent = p.path.toLowerCase() === projectPath.toLowerCase();
                return (
                  <div
                    key={p.path}
                    className={`px-3 py-2.5 flex items-center justify-between group transition-colors ${
                      isCurrent
                        ? 'bg-studio-card/90 border-l-2 border-studio-blue'
                        : 'hover:bg-studio-card/50'
                    }`}
                  >
                    {/* Clickable project row to switch */}
                    <div
                      onClick={() => {
                        setShowProjectDropdown(false);
                        onSwitchProject(p.path);
                      }}
                      className="min-w-0 flex-1 cursor-pointer pr-2"
                    >
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`text-xs font-semibold truncate ${
                            isCurrent ? 'text-studio-blue-light' : 'text-studio-text-primary'
                          }`}
                        >
                          {p.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-studio-blue-subtle text-studio-blue-light font-medium border border-studio-blue-border">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p
                        className="text-[10px] text-studio-text-muted font-mono truncate mt-0.5"
                        title={p.path}
                      >
                        {p.path}
                      </p>
                    </div>

                    {/* Explorer Button on the right side of the row */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenFolderByPath(p.path);
                      }}
                      className="p-1.5 rounded hover:bg-studio-sidebar text-studio-text-muted hover:text-studio-text-primary border border-transparent hover:border-studio-border transition-colors flex-shrink-0"
                      title={`Buka ${p.name} di Windows File Explorer`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom Action: Integrasikan Folder Project Baru */}
            <button
              onClick={() => {
                setShowProjectDropdown(false);
                onAddNewProject();
              }}
              className="w-full px-3 py-2.5 bg-studio-sidebar/90 hover:bg-studio-card flex items-center space-x-2 text-xs text-studio-blue-light font-medium transition-colors border-t border-studio-border"
            >
              <Plus className="w-4 h-4 text-studio-blue-light" />
              <span>+ Integrasikan Folder Project Baru...</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Center Cluster: Device Identity & Push/Pull Sync Hub */}
      <div className="flex items-center space-x-2 bg-studio-sidebar/80 border border-studio-border px-3 py-1 rounded-lg z-30">
        {/* My Device Name (Renamable) */}
        <div className="flex items-center space-x-1.5 pr-2 border-r border-studio-border">
          <Laptop className="w-3.5 h-3.5 text-studio-blue-light" />
          {isEditingDeviceName ? (
            <form onSubmit={handleSaveDeviceName} className="flex items-center space-x-1">
              <input
                type="text"
                value={tempDeviceName}
                onChange={(e) => setTempDeviceName(e.target.value)}
                autoFocus
                className="bg-studio-card border border-studio-blue text-xs text-studio-text-primary px-1.5 py-0.5 rounded outline-none w-28"
              />
              <button
                type="submit"
                className="text-studio-green-text hover:text-white p-0.5"
                title="Simpan nama perangkat"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempDeviceName(myDeviceName);
                  setIsEditingDeviceName(false);
                }}
                className="text-studio-text-muted hover:text-white p-0.5"
                title="Batal"
              >
                <X className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <div className="flex items-center space-x-1">
              <span className="text-[10px] text-studio-text-muted">Perangkat:</span>
              <button
                onClick={() => {
                  setTempDeviceName(myDeviceName);
                  setIsEditingDeviceName(true);
                }}
                className="group flex items-center space-x-1 text-xs font-medium text-studio-text-primary hover:text-studio-blue-light transition-colors"
                title="Klik untuk rename nama perangkat ini"
              >
                <span>{myDeviceName}</span>
                <Edit2 className="w-2.5 h-2.5 text-studio-text-muted group-hover:text-studio-blue-light opacity-60 group-hover:opacity-100" />
              </button>
            </div>
          )}
        </div>

        {/* Sync Partner / Push-Pull Target */}
        <div className="flex items-center space-x-2 relative">
          {activePeer ? (
            <div>
              <button
                onClick={() => {
                  setShowPeerDropdown(!showPeerDropdown);
                  setShowProjectDropdown(false);
                }}
                className="flex items-center space-x-1.5 text-xs text-studio-text-secondary hover:text-studio-text-primary transition-colors py-0.5 px-1.5 rounded hover:bg-studio-card"
                title="Daftar perangkat mitra sinkronisasi"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-studio-green-text" />
                <span className="font-medium text-studio-text-primary">{activePeer.device_name}</span>
                <ChevronDown className="w-3 h-3 text-studio-text-muted" />
              </button>

              {/* Dropdown for peers */}
              {showPeerDropdown && (
                <div className="absolute top-full left-0 mt-1.5 w-64 bg-studio-surface border border-studio-border rounded-lg shadow-xl p-2 z-50 text-xs animate-fadeIn">
                  <div className="text-[10px] uppercase font-bold text-studio-text-muted px-2 py-1">
                    Mitra Push / Pull Terdeteksi
                  </div>
                  {peers.map((p) => (
                    <div
                      key={p.device_id}
                      className="px-2 py-1.5 rounded hover:bg-studio-card flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-studio-text-primary">{p.device_name}</p>
                        <p className="text-[10px] text-studio-text-muted font-mono">{p.ip_addr}:{p.tcp_port}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowPeerDropdown(false);
                          onPull(p);
                        }}
                        disabled={syncingPeer === p.device_id}
                        className="text-[11px] px-2 py-1 rounded bg-studio-blue hover:bg-studio-blue-hover text-white font-medium"
                      >
                        {syncingPeer === p.device_id ? 'Syncing...' : 'Tarik (Pull)'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-studio-text-muted">
              Menunggu perangkat lain di LAN...
            </span>
          )}

          {/* Quick Pull Action Button */}
          {activePeer && (
            <button
              onClick={() => onPull(activePeer)}
              disabled={syncingPeer === activePeer.device_id}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-studio-blue hover:bg-studio-blue-hover text-white text-xs font-medium shadow-sm transition-colors"
              title={`Tarik versi terbaru dari ${activePeer.device_name}`}
            >
              <ArrowDownLeft
                className={`w-3.5 h-3.5 ${
                  syncingPeer === activePeer.device_id ? 'animate-bounce' : ''
                }`}
              />
              <span>
                {syncingPeer === activePeer.device_id ? 'Menarik...' : 'Tarik Versi (Pull)'}
              </span>
            </button>
          )}

          {/* Last sync info */}
          {lastSyncInfo && (
            <span className="text-[10px] text-studio-text-muted hidden xl:inline">
              (Terakhir {lastSyncInfo.type}: {lastSyncInfo.peerName})
            </span>
          )}
        </div>
      </div>

      {/* 3. Right Cluster: After Effects Lock Indicator & Controls */}
      <div className="flex items-center space-x-2 flex-shrink-0 z-30">
        {/* AE File Lock Status */}
        {primaryAep ? (
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
              isLocked
                ? 'bg-studio-red-subtle border-studio-red-border text-studio-red-text'
                : 'bg-studio-green-subtle border-studio-green-border text-studio-green-text'
            }`}
            title={
              isLocked
                ? `File sedang diedit di After Effects (${primaryAep.lock.process_name || 'AfterFX.exe'}). Sinkronisasi ditahan.`
                : 'File aman untuk disimpan atau disinkronkan.'
            }
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLocked ? 'bg-red-400 animate-ping' : 'bg-green-400'
              }`}
            />
            <span className="max-w-[130px] truncate">
              {isLocked ? 'Terkunci di AE' : 'Aman Disinkronkan'}
            </span>
          </div>
        ) : null}

        {/* Browser Mock Mode Toggle */}
        {isMockMode && onSimulateLockToggle && (
          <button
            onClick={onSimulateLockToggle}
            className="px-2 py-1 rounded border border-studio-border hover:border-studio-borderHover bg-studio-sidebar text-[10px] text-amber-300 font-medium transition-colors"
            title="Simulasi lock file After Effects di browser"
          >
            Lock AE: {isLocked ? 'ON' : 'OFF'}
          </button>
        )}

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 rounded-md bg-studio-sidebar hover:bg-studio-card border border-studio-border text-studio-text-secondary hover:text-studio-text-primary transition-colors"
          title="Pindai ulang status file dan lock After Effects"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-studio-blue-light' : ''}`} />
        </button>

        {/* Theme Settings Button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-md bg-studio-sidebar hover:bg-studio-card border border-studio-border text-studio-text-secondary hover:text-studio-text-primary transition-colors text-xs"
          title="Pengaturan Tema & Warna UI (After Effects Appearance)"
        >
          <Settings className="w-3.5 h-3.5 text-studio-blue-light" />
          <span className="text-[11px] hidden lg:inline font-medium">Tema</span>
        </button>

        {/* Tour Toggle */}
        <button
          onClick={onToggleGuide}
          className={`p-1.5 rounded-md border text-xs font-medium transition-colors ${
            isGuideActive
              ? 'bg-studio-blue text-white border-studio-blue-light'
              : 'bg-studio-sidebar border-studio-border text-studio-text-secondary hover:text-studio-text-primary'
          }`}
          title="Panduan penggunaan langkah demi langkah"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
