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
}) => {
  const [activeTab, setActiveTab] = useState<'changes' | 'history'>('changes');
  const [commitMessage, setCommitMessage] = useState('');
  const [commitDesc, setCommitDesc] = useState('');
  const [searchHistory, setSearchHistory] = useState('');

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

  const filteredSnapshots = snapshots.filter((s) =>
    s.message.toLowerCase().includes(searchHistory.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-studio-sidebar border-r border-studio-border select-none">
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
          <span>Perubahan File</span>
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
          <span>Riwayat Versi</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-studio-card text-studio-text-secondary">
            {snapshots.length}
          </span>
        </button>
      </div>

      {/* 2. Tab: Perubahan File (Changes) */}
      {activeTab === 'changes' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Subheader & Scan Action */}
          <div className="px-3.5 py-2 border-b border-studio-border flex items-center justify-between bg-studio-surface/30">
            <span className="text-[11px] text-studio-text-muted">
              {changedFiles.length > 0
                ? `${changedFiles.length} file (${scanResult?.total_mb.toFixed(1)} MB)`
                : 'Belum dipindai'}
            </span>
            <button
              onClick={onScan}
              disabled={scanning}
              className="flex items-center space-x-1.5 px-2 py-1 rounded bg-studio-card hover:bg-studio-cardHover border border-studio-border text-studio-text-primary text-[11px] font-medium transition-colors"
            >
              <Play className={`w-3 h-3 text-studio-blue-light ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Memindai...' : 'Pindai'}</span>
            </button>
          </div>

          {/* Changed Files List */}
          <div className="flex-1 overflow-y-auto divide-y divide-studio-borderSubtle">
            {changedFiles.length === 0 ? (
              <div className="p-8 text-center text-studio-text-muted text-xs space-y-2">
                <FileCheck className="w-8 h-8 text-studio-text-muted mx-auto opacity-40" />
                <p className="font-medium text-studio-text-secondary">Tidak ada perubahan terdeteksi.</p>
                <p className="text-[11px] text-studio-text-muted max-w-xs mx-auto">
                  Klik "Pindai" untuk memeriksa file baru atau editan di folder project.
                </p>
              </div>
            ) : (
              changedFiles.map((file, idx) => {
                const isSelected = selectedFile?.path === file.path;
                return (
                  <div
                    key={idx}
                    onClick={() => onSelectFile(file)}
                    className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                      isSelected
                        ? 'bg-studio-card border-l-2 border-studio-blue'
                        : 'hover:bg-studio-card/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      {getFileIcon(file.path)}
                      <div className="truncate">
                        <p className="font-medium text-studio-text-primary truncate leading-tight">
                          {file.path.split('/').pop()}
                        </p>
                        <p className="text-[10px] text-studio-text-muted truncate leading-none mt-0.5 font-mono">
                          {file.path}
                        </p>
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
                        {file.state}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Commit Box (Simplified GitHub Desktop Style) */}
          <form
            onSubmit={handleCommitSubmit}
            className="p-3 border-t border-studio-border bg-studio-surface/40 space-y-2"
          >
            <div className="flex items-center justify-between text-[11px] text-studio-text-muted">
              <span>Simpan Versi (Snapshot)</span>
              <span className="text-[10px] text-studio-blue-light font-mono flex items-center space-x-1">
                <Laptop className="w-2.5 h-2.5" />
                <span>{myDeviceName}</span>
              </span>
            </div>

            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Ringkasan revisi (contoh: Koreksi warna scene 1)..."
              required
              className="w-full px-2.5 py-1.5 rounded bg-studio-sidebar border border-studio-border focus:border-studio-blue focus:outline-none text-xs text-studio-text-primary placeholder-studio-text-muted transition-colors"
            />

            <textarea
              value={commitDesc}
              onChange={(e) => setCommitDesc(e.target.value)}
              placeholder="Catatan tambahan (opsional)..."
              rows={2}
              className="w-full px-2.5 py-1.5 rounded bg-studio-sidebar border border-studio-border focus:border-studio-blue focus:outline-none text-xs text-studio-text-primary placeholder-studio-text-muted resize-none transition-colors"
            />

            <button
              type="submit"
              disabled={creatingSnapshot || !commitMessage.trim()}
              className={`w-full py-2 rounded-md font-semibold text-xs text-white shadow-sm transition-all flex items-center justify-center space-x-1.5 ${
                creatingSnapshot || !commitMessage.trim()
                  ? 'bg-studio-card text-studio-text-muted cursor-not-allowed border border-studio-border'
                  : 'bg-studio-blue hover:bg-studio-blue-hover'
              }`}
            >
              <GitCommit className={`w-3.5 h-3.5 ${creatingSnapshot ? 'animate-spin' : ''}`} />
              <span>
                {creatingSnapshot ? 'Menyimpan Versi...' : 'Simpan Versi ke Snapshot'}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* 3. Tab: Riwayat Versi (History) */}
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
                placeholder="Cari riwayat revisi..."
                className="w-full pl-8 pr-2.5 py-1 rounded bg-studio-sidebar border border-studio-border text-xs text-studio-text-primary placeholder-studio-text-muted focus:border-studio-blue focus:outline-none"
              />
            </div>
          </div>

          {/* History Snapshot List */}
          <div className="flex-1 overflow-y-auto divide-y divide-studio-borderSubtle">
            {filteredSnapshots.length === 0 ? (
              <div className="p-8 text-center text-studio-text-muted text-xs">
                Tidak ada riwayat versi yang cocok.
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
                      <span>{snap.total_files} file</span>
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
