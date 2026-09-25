import React from 'react';
import { RepoStatusDto } from '../types';
import { FolderGit2, Lock, Unlock, HardDrive, RefreshCw } from 'lucide-react';

interface Props {
  status: RepoStatusDto | null;
  projectPath: string;
  onRefresh: () => void;
  loading: boolean;
}

export const Header: React.FC<Props> = ({ status, projectPath, onRefresh, loading }) => {
  const primaryAep = status?.aep_files[0];
  const isLocked = primaryAep?.lock.is_locked;

  return (
    <header className="bg-studio-surface border-b border-studio-border px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-indigo-500/20 shadow-md">
          <FolderGit2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-white tracking-wide">CompSync</h1>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              After Effects P2P
            </span>
          </div>
          <p className="text-xs text-gray-400 flex items-center space-x-1 mt-0.5">
            <HardDrive className="w-3.5 h-3.5 text-gray-500" />
            <span className="font-mono text-gray-300">{projectPath || 'No Project Selected'}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {primaryAep ? (
          <div
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
              isLocked
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-rose-500/10 shadow-sm'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-emerald-500/10 shadow-sm'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isLocked ? 'bg-rose-500' : 'bg-emerald-400'
              }`}
            />
            {isLocked ? (
              <div className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>
                  LOCKED BY {primaryAep.lock.process_name || 'AFTER EFFECTS'}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{primaryAep.file_name} (UNLOCKED - Safe to Sync)</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-400 bg-studio-card px-3 py-1.5 rounded-full border border-studio-border">
            No .aep found
          </div>
        )}

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-lg bg-studio-card border border-studio-border text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
          title="Refresh Status & Lock Probe"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
