import React, { useState } from 'react';
import {
  ScanResultDto,
  SnapshotSummaryDto,
  ScannedFileDto,
} from '../types';
import {
  GitCommit,
  Clock,
  Layers,
  Video,
  Music,
  Image,
  FileText,
  Play,
  Search,
  CheckCircle,
  FileCheck,
  Laptop,
} from 'lucide-react';
import { Language, I18N } from '../i18n';

interface Props {
  scanResult: ScanResultDto | null;
  snapshots: SnapshotSummaryDto[];
  onScan: () => void;
  onSnapshot: (message: string) => void;
  scanning: boolean;
  creatingSnapshot: boolean;
  selectedFile: ScannedFileDto | null;
  onSelectFile: (file: ScannedFileDto) => void;
  selectedSnapshotId: string | null;
  onSelectSnapshot: (snap: SnapshotSummaryDto) => void;
  myDeviceName: string;
  language?: Language;
}

export const LeftPanel: React.FC<Props> = ({
  scanResult,
  snapshots,
  onScan,
  onSnapshot,
  scanning,
  creatingSnapshot,
  selectedFile,
  onSelectFile,
  selectedSnapshotId,
  onSelectSnapshot,
  myDeviceName,
  language = 'en',
}) => {
  const [activeTab, setActiveTab] = useState<'changes' | 'history'>('changes');
  const [commitMessage, setCommitMessage] = useState('');
  const [commitDesc, setCommitDesc] = useState('');
  const [searchHistory, setSearchHistory] = useState('');
  const t = I18N[language];

  const changedFiles = scanResult?.files || [];
  const modifiedCount = changedFiles.filter((f) => f.state !== 'Tersimpan').length;

  const handleCommitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;
    const fullMsg = commitDesc.trim()
      ? `${commitMessage.trim()}\n\n${commitDesc.trim()}`
      : commitMessage.trim();
    onSnapshot(fullMsg);
    setCommitMessage('');
    setCommitDesc('');
  };

  const getFileIcon = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    if (ext === 'aep') return <Layers className="w-3.5 h-3.5 text-purple-400" />;
    if (['mov', 'mp4', 'avi', 'mkv', 'mxf', 'prores'].includes(ext || ''))
      return <Video className="w-3.5 h-3.5 text-studio-blue-light" />;
    if (['wav', 'mp3', 'aac', 'cfa'].includes(ext || ''))
      return <Music className="w-3.5 h-3.5 text-studio-green-text" />;
    if (['png', 'jpg', 'jpeg', 'psd', 'ai', 'exr'].includes(ext || ''))
      return <Image className="w-3.5 h-3.5 text-amber-400" />;
    return <FileText className="w-3.5 h-3.5 text-studio-text-muted" />;
  };

  const getStatusLabel = (state: string) => {
    if (state === 'Tersimpan') return t.statusSynced;
    if (state === 'Diubah') return t.statusModified;
    if (state === 'Baru') return t.statusNew;
    return state;
  };

  const filteredSnapshots = snapshots.filter((s) =>
    s.message.toLowerCase().includes(searchHistory.toLowerCase())
  );

  const totalVolumeMb = scanResult?.total_mb || 0;
  const totalVolumeDisplay =
    totalVolumeMb >= 1024
      ? `${(totalVolumeMb / 1024).toFixed(1)} GB`
      : `${totalVolumeMb.toFixed(1)} MB`;

  return (
    <div data-tour="left-panel" className="flex flex-col h-full bg-studio-sidebar select-none">
      {/* 1. Tab Switcher (Changes vs History) */}
      <div className="flex border-b border-studio-border bg-studio-surface/50">
        <button
          onClick={() => setActiveTab('changes')}
          className={`flex-1 py-2.5 px-3 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'changes'
              ? 'border-studio-blue text-studio-text-primary bg-studio-sidebar'
              : 'border-transparent text-studio-text-muted hover:text-studio-text-secondary'
          }`}
        >
          <span>{t.changes}</span>
          {modifiedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-studio-blue text-white">
              {modifiedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 px-3 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-studio-blue text-studio-text-primary bg-studio-sidebar'
              : 'border-transparent text-studio-text-muted hover:text-studio-text-secondary'
          }`}
        >
          <span>{t.history}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-studio-card text-studio-text-secondary">
            {snapshots.length}
          </span>
        </button>
      </div>

      {/* 2. Tab: Changes */}
      {activeTab === 'changes' && (
        <div data-tour="step-4" className="flex flex-col flex-1 overflow-hidden">
          {/* Header Bar */}
          <div className="px-3.5 py-2 border-b border-studio-border bg-studio-sidebar/70 flex items-center justify-between text-xs">
            <span className="text-studio-text-muted font-mono text-[11px]">
              {t.filesCount(changedFiles.length, totalVolumeDisplay)}
            </span>

            <button
              onClick={onScan}
              disabled={scanning}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-studio-card hover:bg-studio-cardHover border border-studio-border text-studio-blue-light font-medium text-xs transition-colors"
              title="Rescan directory for file changes"
            >
              <Play className={`w-3 h-3 fill-current ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? t.scanning : t.scan}</span>
            </button>
          </div>

          {/* Changed Files List */}
          <div className="flex-1 overflow-y-auto divide-y divide-studio-borderSubtle">
            {changedFiles.length === 0 ? (
              <div className="p-8 text-center text-studio-text-muted text-xs flex flex-col items-center justify-center space-y-2">
                <CheckCircle className="w-8 h-8 text-studio-green-text opacity-70" />
                <p>{t.allSynced}</p>
                <p className="text-[11px] text-studio-text-muted">{t.noNewChanges}</p>
              </div>
            ) : (
              changedFiles.map((file) => {
                const isSelected = selectedFile?.path === file.path;
                return (
                  <div
                    key={file.path}
                    onClick={() => onSelectFile(file)}
                    className={`px-3 py-2 cursor-pointer transition-colors text-xs flex items-center justify-between group ${
                      isSelected
                        ? 'bg-studio-blue/15 border-l-2 border-studio-blue'
                        : 'hover:bg-studio-card/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate pr-2">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.path)}
                      </div>
                      <div className="truncate">
                        <span className="font-medium text-studio-text-primary block truncate">
                          {file.path.split('/').pop()}
                        </span>
                        <span className="text-[10px] text-studio-text-muted font-mono block truncate">
                          {file.path}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="text-[10px] text-studio-text-muted font-mono">
                        {file.size_mb >= 1024
                          ? `${(file.size_mb / 1024).toFixed(1)} GB`
                          : `${file.size_mb.toFixed(1)} MB`}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-medium border ${
                          file.state === 'Baru'
                            ? 'bg-studio-green-subtle text-studio-green-text border-studio-green-border'
                            : file.state === 'Diubah'
                            ? 'bg-studio-blue-subtle text-studio-blue-light border-studio-blue-border'
                            : 'bg-studio-card text-studio-text-muted border-studio-border'
                        }`}
                      >
                        {getStatusLabel(file.state)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Commit Box (Authentic GitHub Desktop Proportion & Layout) */}
          <form
            onSubmit={handleCommitSubmit}
            data-tour="step-5"
            className="p-3.5 border-t border-studio-border bg-studio-sidebar space-y-2.5 flex-shrink-0"
          >
            {/* Top row: Avatar + Summary Input */}
            <div className="flex items-center space-x-2.5">
              <div
                className="w-7 h-7 rounded-full bg-studio-blue/20 border border-studio-blue-border text-studio-blue-light font-bold text-xs flex items-center justify-center flex-shrink-0 select-none shadow-sm"
                title={`Device: ${myDeviceName}`}
              >
                {myDeviceName.charAt(0).toUpperCase() || 'U'}
              </div>

              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder={t.summaryPlaceholder}
                required
                className="flex-1 px-3 py-1.5 rounded-lg bg-studio-bg border border-studio-border focus:border-studio-blue focus:outline-none text-xs text-studio-text-primary placeholder:text-studio-text-muted transition-colors"
              />
            </div>

            {/* Description Textarea (Taller, GitHub Desktop style) */}
            <div className="relative">
              <textarea
                value={commitDesc}
                onChange={(e) => setCommitDesc(e.target.value)}
                placeholder={t.descriptionPlaceholder}
                className="w-full h-24 px-3 py-2 rounded-lg bg-studio-bg border border-studio-border focus:border-studio-blue focus:outline-none text-xs text-studio-text-primary placeholder:text-studio-text-muted resize-none leading-relaxed transition-colors"
              />
            </div>

            {/* Commit Button (Tall & prominent with file count badge like GitHub Desktop) */}
            <button
              type="submit"
              disabled={creatingSnapshot || !commitMessage.trim()}
              className={`w-full py-2.5 rounded-lg font-semibold text-xs text-white shadow-md transition-all flex items-center justify-center space-x-2 ${
                creatingSnapshot || !commitMessage.trim()
                  ? 'bg-studio-card text-studio-text-muted cursor-not-allowed border border-studio-border'
                  : 'bg-studio-blue hover:bg-studio-blue-hover active:scale-[0.99]'
              }`}
            >
              <GitCommit className={`w-4 h-4 ${creatingSnapshot ? 'animate-spin' : ''}`} />
              <span>
                {creatingSnapshot
                  ? t.savingSnapshot
                  : t.commitToSnapshot(modifiedCount)}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* 3. Tab: History */}
      {activeTab === 'history' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* History Search */}
          <div className="p-2.5 border-b border-studio-border bg-studio-surface/30">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-studio-text-muted absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                placeholder={t.searchHistory}
                className="w-full pl-8 pr-2.5 py-1 rounded bg-studio-sidebar border border-studio-border text-xs text-studio-text-primary placeholder-studio-text-muted focus:border-studio-blue focus:outline-none"
              />
            </div>
          </div>

          {/* History Snapshot List */}
          <div className="flex-1 overflow-y-auto divide-y divide-studio-borderSubtle">
            {filteredSnapshots.length === 0 ? (
              <div className="p-8 text-center text-studio-text-muted text-xs">
                {t.noMatchingHistory}
              </div>
            ) : (
              filteredSnapshots.map((snap) => {
                const isSelected = selectedSnapshotId === snap.snapshot_id;
                return (
                  <div
                    key={snap.snapshot_id}
                    onClick={() => onSelectSnapshot(snap)}
                    className={`p-3 cursor-pointer transition-colors text-xs ${
                      isSelected
                        ? 'bg-studio-card border-l-2 border-studio-blue'
                        : 'hover:bg-studio-card/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-studio-text-primary line-clamp-1 pr-2">
                        {snap.message}
                      </h4>
                      <span className="text-[10px] font-mono text-studio-blue-light flex-shrink-0 bg-studio-surface px-1.5 py-0.5 rounded border border-studio-border">
                        {snap.snapshot_id.slice(0, 8)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mt-1.5 text-[10px] text-studio-text-muted">
                      <span className="font-medium text-studio-text-secondary flex items-center space-x-1">
                        <Laptop className="w-2.5 h-2.5 text-studio-text-muted" />
                        <span>{snap.author_name}</span>
                      </span>
                      <span>•</span>
                      <span>{new Date(snap.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{snap.total_files} files</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
