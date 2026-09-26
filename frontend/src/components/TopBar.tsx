import React, { useState, useRef, useEffect } from "react";
import { RepoStatusDto, PeerInfo } from "../types";
import {
  FolderOpen,
  Lock,
  Unlock,
  HelpCircle,
  Download,
  Laptop,
  ArrowUpRight,
  ChevronDown,
  FolderPlus,
  ExternalLink,
  Settings,
  KeyRound,
} from "lucide-react";
import { Language, I18N } from "../i18n";

export interface ProjectItem {
  name: string;
  path: string;
}

interface Props {
  projectPath: string;
  projectList: ProjectItem[];
  onSelectProject?: (path: string) => void;
  onSwitchProject?: (path: string) => void;
  onAddNewProject: () => void;
  onJoinProject: () => void;
  onOpenFolderPath?: (path: string) => void;
  onOpenFolderByPath?: (path: string) => void;
  status: RepoStatusDto | null;
  onRefresh: () => void;
  loading: boolean;
  onToggleDemoLock?: () => void;
  onSimulateLockToggle?: () => void;
  isMockMode: boolean;
  isGuideActive: boolean;
  onToggleGuide: () => void;
  onOpenSettings: () => void;
  onOpenPairing: () => void;
  myDeviceName: string;
  onRenameMyDevice: (newName: string) => void;
  peers: PeerInfo[];
  onPull: (peer: PeerInfo) => void;
  syncingPeer: string | null;
  lastSyncInfo: {
    peerName: string;
    time: string;
    type: "push" | "pull";
  } | null;
  leftWidth?: number;
  language?: Language;
}

export const TopBar: React.FC<Props> = ({
  projectPath,
  projectList,
  onSelectProject,
  onSwitchProject,
  onAddNewProject,
  onJoinProject,
  onOpenFolderPath,
  onOpenFolderByPath,
  status,
  onRefresh,
  loading,
  onToggleDemoLock,
  onSimulateLockToggle,
  isMockMode,
  isGuideActive,
  onToggleGuide,
  onOpenSettings,
  onOpenPairing,
  myDeviceName,
  onRenameMyDevice,
  peers,
  onPull,
  syncingPeer,
  lastSyncInfo,
  leftWidth = 390,
  language = "en",
}) => {
  const [selectedPeerIdx, setSelectedPeerIdx] = useState(0);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = I18N[language];

  const handleProjectSelect = onSelectProject || onSwitchProject || (() => {});
  const handleOpenFolder = onOpenFolderPath || onOpenFolderByPath || (() => {});

  const primaryAep = status?.aep_files?.[0];
  const isLocked = primaryAep?.lock?.is_locked ?? false;
  const activePeer = peers[selectedPeerIdx] || peers[0] || null;

  const folderName = projectPath
    ? projectPath.replace(/\\/g, "/").split("/").filter(Boolean).pop() ||
      projectPath
    : t.selectProject;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsProjectMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-studio-sidebar border-b border-studio-border h-[56px] flex items-center select-none z-30">
      {/* 1. Left Section: Seamless Project Selector (No floating inner box) */}
      <div style={{ width: `${leftWidth}px` }} className="h-full flex items-stretch flex-shrink-0">
        <div className={`w-10 flex items-center justify-center border-r border-studio-border ${isLocked ? "text-studio-red-text" : "text-studio-green-text"}`} title={isLocked ? t.lockedAE : t.syncReady}>
          {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </div>
        <div
        data-tour="step-1"
        style={{ width: `calc(${leftWidth}px - 40px)` }}
        className="h-full border-r border-studio-border relative flex-shrink-0 flex items-stretch"
        ref={dropdownRef}
        >
        <button
          onClick={() => setIsProjectMenuOpen((prev) => !prev)}
          className={`w-full h-full flex items-center justify-between px-4 transition-colors text-left group cursor-pointer ${
            isProjectMenuOpen
              ? "bg-studio-card/80"
              : "hover:bg-white/[0.04]"
          }`}
          title={t.selectProject}
        >
          <div className="flex items-center space-x-3 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-lg bg-studio-blue/15 flex items-center justify-center text-studio-blue-light font-bold text-sm flex-shrink-0">
              <FolderOpen className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-semibold text-studio-text-muted uppercase tracking-wider leading-none">
                {t.activeProject}
              </div>
              <div className="text-[13px] font-semibold text-studio-text-primary truncate mt-1">
                {folderName}
              </div>
            </div>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-studio-text-muted group-hover:text-studio-text-primary transition-transform duration-150 flex-shrink-0 ${
              isProjectMenuOpen ? "rotate-180 text-studio-blue-light" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu (Flush Edge-to-Edge directly underneath) */}
        {isProjectMenuOpen && (
          <div
            style={{ width: `${leftWidth}px` }}
            className="absolute left-0 top-full bg-studio-surface border-x border-b border-studio-border rounded-b-xl shadow-2xl overflow-hidden z-50 animate-fade-in"
          >
            <div className="px-4 py-2.5 border-b border-studio-border bg-studio-sidebar/90 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-studio-text-muted">
                {t.integratedProjects}
              </span>
              <span className="text-[10px] font-mono text-studio-text-muted">
                {projectList.length} Folders
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-studio-border/40">
              {projectList.map((proj) => {
                const isCurrent =
                  proj.path.replace(/\\/g, "/").toLowerCase() ===
                  projectPath.replace(/\\/g, "/").toLowerCase();

                return (
                  <div
                    key={proj.path}
                    className={`flex items-center justify-between px-4 py-2.5 transition-colors ${
                      isCurrent
                        ? "bg-studio-blue/15"
                        : "hover:bg-studio-card/70"
                    }`}
                  >
                    <button
                      onClick={() => {
                        handleProjectSelect(proj.path);
                        setIsProjectMenuOpen(false);
                      }}
                      className="flex-1 min-w-0 text-left flex items-center space-x-2.5 pr-2"
                    >
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          isCurrent
                            ? "bg-studio-blue-light"
                            : "bg-studio-border"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-xs font-semibold truncate ${
                            isCurrent
                              ? "text-studio-text-primary"
                              : "text-studio-text-secondary"
                          }`}
                        >
                          {proj.name}
                        </div>
                        <div className="text-[10px] font-mono text-studio-text-muted truncate mt-0.5">
                          {proj.path}
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFolder(proj.path);
                      }}
                      className="p-1.5 rounded-lg bg-studio-card hover:bg-studio-cardHover border border-studio-border text-studio-text-secondary hover:text-studio-text-primary transition-colors flex-shrink-0"
                      title={t.openInExplorer}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 border-t border-studio-border bg-studio-sidebar/90">
              <button
                onClick={() => {
                  setIsProjectMenuOpen(false);
                  onAddNewProject();
                }}
                className="w-full py-2 px-3 rounded-lg bg-studio-blue hover:bg-studio-blue-hover text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>{t.addNewProject}</span>
              </button>
              <button
                onClick={() => {
                  setIsProjectMenuOpen(false);
                  onJoinProject();
                }}
                className="mt-2 w-full rounded-lg border border-studio-border bg-studio-card px-3 py-2 text-xs font-semibold text-studio-text-secondary transition-colors hover:bg-studio-cardHover hover:text-studio-text-primary"
              >
                <span>{language === "id" ? "Gabung Project Existing..." : "Join Existing Project..."}</span>
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* 2. Right Section: Hub Sync + Actions */}
      <div className="flex-1 px-4 flex items-center justify-between min-w-0">
        {/* Center: Device Identity & Direct Push/Pull Sync Control */}
        <div
          data-tour="step-2"
          className="flex items-center space-x-2.5 bg-studio-bg px-3.5 py-1.5 rounded-xl border border-studio-border"
        >
          {/* Device Rename Box */}
          <div className="flex items-center space-x-1.5 pr-2.5 border-r border-studio-border">
            <Laptop className="w-3.5 h-3.5 text-studio-text-muted" />
            <span className="text-[11px] text-studio-text-muted">{t.device}</span>

            <span className="text-xs font-semibold text-studio-text-primary">{myDeviceName}</span>
          </div>

          {/* Peer Selector & Push/Pull Action */}
          {peers.length > 0 && activePeer ? (
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <select
                value={selectedPeerIdx}
                onChange={(e) => setSelectedPeerIdx(Number(e.target.value))}
                className="bg-studio-surface/60 border border-studio-border/60 rounded px-1.5 py-0.5 text-xs font-medium text-studio-text-secondary focus:outline-none cursor-pointer max-w-[210px]"
                title="Select LAN partner"
              >
                {peers.map((p, idx) => (
                  <option
                    key={p.device_id}
                    value={idx}
                    className="bg-studio-surface text-studio-text-primary"
                  >
                    {p.device_name} ({p.ip_addr})
                  </option>
                ))}
              </select>

              <button
                onClick={() => onPull(activePeer)}
                disabled={syncingPeer !== null || isLocked}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  isLocked
                    ? "bg-studio-card text-studio-text-muted cursor-not-allowed"
                    : "bg-studio-blue hover:bg-studio-blue-hover text-white shadow-sm"
                }`}
                title="Pull latest revisions from this partner"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {syncingPeer === activePeer.device_id
                    ? t.syncing
                    : t.pullLatest}
                </span>
              </button>

              {lastSyncInfo && (
                <span className="hidden xl:inline-flex items-center space-x-1 text-[10px] text-studio-green-text bg-studio-green-bg px-2 py-0.5 rounded border border-studio-green-border">
                  <ArrowUpRight className="w-2.5 h-2.5" />
                  <span>
                    {t.syncedTo} {lastSyncInfo.peerName} ({lastSyncInfo.time})
                  </span>
                </span>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-studio-text-muted px-1">
              {t.searchingPeers}
            </span>
          )}
        </div>

        {/* Right: Lock Status & Controls */}
        <div
          data-tour="step-3"
          className="flex items-center space-x-2.5 flex-shrink-0"
        >
          {/* Icon-Only Settings Button */}
          <button
            onClick={onOpenPairing}
            disabled={!status?.is_initialized}
            className="p-2 rounded-lg bg-studio-surface hover:bg-studio-card border border-studio-border text-studio-text-secondary hover:text-studio-text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            title={language === "id" ? "Kode pairing project" : "Project pairing code"}
          >
            <KeyRound className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-studio-surface hover:bg-studio-card border border-studio-border text-studio-text-secondary hover:text-studio-text-primary transition-colors"
            title={t.settings}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Tour / Help Button */}
          <button
            onClick={onToggleGuide}
            className={`p-2 rounded-lg border transition-colors ${
              isGuideActive
                ? "bg-studio-blue/20 border-studio-blue-border text-studio-blue-light"
                : "bg-studio-surface hover:bg-studio-card border-studio-border text-studio-text-secondary hover:text-studio-text-primary"
            }`}
            title={t.quickGuide}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
