import React from 'react';
import { RepoStatusDto } from '../types';
import {
  FolderGit2,
  FolderOpen,
  ExternalLink,
  RefreshCw,
  HelpCircle,
  Folder,
} from 'lucide-react';

interface Props {
  status: RepoStatusDto | null;
  projectPath: string;
  onRefresh: () => void;
  onSelectFolder: () => void;
  onOpenInExplorer: () => void;
  onToggleGuide: () => void;
  isGuideActive: boolean;
  loading: boolean;
  onSimulateLockToggle?: () => void;
  isMockMode?: boolean;
}

export const Header: React.FC<Props> = ({
  status,
  projectPath,
  onRefresh,
  onSelectFolder,
  onOpenInExplorer,
  onToggleGuide,
  isGuideActive,
  loading,
  onSimulateLockToggle,
  isMockMode,
}) => {
  const primaryAep = status?.aep_files?.[0];
  const isLocked = primaryAep?.lock.is_locked;
  const projectName =
    status?.project_name ||
    projectPath.split('/').filter(Boolean).pop() ||
    projectPath.split('\\').filter(Boolean).pop() ||
    'Project After Effects';

  return (
    <header className="bg-studio-surface border-b border-studio-border px-5 py-2.5 flex items-center justify-between select-none shadow-sm z-30">
      {/* Left: Project Selector (GitHub Desktop Style) */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-studio-card border border-studio-border hover:border-studio-borderHover rounded-lg px-3 py-1.5 transition-all">
          <FolderGit2 className="w-4 h-4 text-studio-blue-light flex-shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-gray-400 font-medium leading-none uppercase tracking-wider">
              Project Aktif
            </span>
            <span className="text-xs font-semibold text-gray-100 max-w-[200px] truncate leading-tight mt-0.5" title={projectName}>
              {projectName}
            </span>
          </div>
        </div>

        <button
          onClick={onSelectFolder}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-studio-card hover:bg-studio-border border border-studio-border hover:border-gray-500 text-xs font-medium text-gray-200 transition-colors"
          title="Ganti folder project After Effects"
        >
          <FolderOpen className="w-3.5 h-3.5 text-gray-400" />
          <span>Ganti Folder...</span>
        </button>

        <button
          onClick={onOpenInExplorer}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-studio-card hover:bg-studio-border border border-studio-border text-gray-300 hover:text-white transition-colors text-xs"
          title="Buka folder project di Windows File Explorer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          <span className="hidden sm:inline">Buka di Explorer</span>
        </button>
      </div>

      {/* Center: Clean After Effects Lock Status Badge */}
      <div className="flex items-center">
        {primaryAep ? (
          <div
            className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium transition-all ${
              isLocked
                ? 'bg-studio-red-subtle border-studio-red-border text-studio-red-text'
                : 'bg-studio-green-subtle border-studio-green-border text-studio-green-text'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLocked ? 'bg-red-500 animate-pulse' : 'bg-green-500'
              }`}
            />
            <span>
              {isLocked
                ? `Terkunci di After Effects (${primaryAep.lock.process_name || 'AfterFX.exe'})`
                : `${primaryAep.file_name} (Aman Disinkronkan)`}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full border border-studio-border text-xs text-gray-400 bg-studio-card">
            <span className="w-2 h-2 rounded-full bg-gray-500" />
            <span>Tidak ada file .aep di folder ini</span>
          </div>
        )}
      </div>

      {/* Right: Actions & Guides */}
      <div className="flex items-center space-x-2.5">
        {isMockMode && onSimulateLockToggle && (
          <button
            onClick={onSimulateLockToggle}
            className="px-2.5 py-1 rounded border border-studio-border hover:border-yellow-500/50 bg-studio-card text-[11px] text-yellow-300 font-medium transition-colors"
            title="Uji coba simulasi status lock di browser"
          >
            Simulasi Lock: {isLocked ? 'Aktif' : 'Nonaktif'}
          </button>
        )}

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-studio-card hover:bg-studio-border border border-studio-border text-gray-200 hover:text-white transition-colors text-xs font-medium"
          title="Periksa ulang status file dan lock After Effects"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-studio-blue-light' : 'text-gray-400'}`} />
          <span>Pindai Ulang</span>
        </button>

        <button
          onClick={onToggleGuide}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            isGuideActive
              ? 'bg-studio-blue text-white border-studio-blue-light shadow-sm'
              : 'bg-studio-card border-studio-border text-gray-300 hover:text-white hover:border-gray-500'
          }`}
          title="Tampilkan petunjuk langsung"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{isGuideActive ? 'Sembunyikan Petunjuk' : 'Petunjuk'}</span>
        </button>
      </div>
    </header>
  );
};
