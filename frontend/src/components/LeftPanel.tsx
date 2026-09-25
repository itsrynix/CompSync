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
} from 'lucide-react';

interface Props {
  scanResult: ScanResultDto | null;
  snapshots: SnapshotSummaryDto[];
  onScan: () => void;
  onSnapshot: (message: string) => void;
  scanning: boolean;
  creatingSnapshot: boolean;
  selectedSnapshotId: string | null;
  onSelectSnapshot: (snap: SnapshotSummaryDto) => void;
}

export const LeftPanel: React.FC<Props> = ({
  scanResult,
  snapshots,
  onScan,
  onSnapshot,
  scanning,
  creatingSnapshot,
  selectedSnapshotId,
  onSelectSnapshot,
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
    if (ext === 'aep') return <Layers className="w-4 h-4 text-purple-400" />;
    if (['mov', 'mp4', 'avi', 'mkv', 'mxf', 'prores'].includes(ext || ''))
      return <Video className="w-4 h-4 text-studio-blue-light" />;
    if (['wav', 'mp3', 'aac', 'cfa'].includes(ext || ''))
      return <Music className="w-4 h-4 text-emerald-400" />;
    if (['png', 'jpg', 'jpeg', 'psd', 'ai', 'exr'].includes(ext || ''))
      return <Image className="w-4 h-4 text-amber-400" />;
    return <FileText className="w-4 h-4 text-gray-400" />;
  };

  const filteredSnapshots = snapshots.filter((s) =>
    s.message.toLowerCase().includes(searchHistory.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-studio-surface border-r border-studio-border select-none">
      {/* Tab Switcher (Changes vs History) */}
      <div className="flex border-b border-studio-border bg-studio-bg">
        <button
          onClick={() => setActiveTab('changes')}
          className={`flex-1 py-2.5 px-4 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'changes'
              ? 'border-studio-blue text-white bg-studio-surface'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>Perubahan File</span>
          {modifiedCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-studio-blue text-white">
              {modifiedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 px-4 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-studio-blue text-white bg-studio-surface'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>Riwayat Versi</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-studio-card text-gray-300">
            {snapshots.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Perubahan (Changes) */}
      {activeTab === 'changes' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Subheader & Scan Action */}
          <div className="p-3 border-b border-studio-border flex items-center justify-between bg-studio-card/50">
            <span className="text-xs text-gray-300 font-medium">
              {changedFiles.length > 0
                ? `${changedFiles.length} file terpantau (${scanResult?.total_mb.toFixed(1)} MB)`
                : 'Belum dipindai'}
            </span>
            <button
              onClick={onScan}
              disabled={scanning}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-studio-blue hover:bg-studio-blue-hover text-white text-xs font-medium transition-colors"
            >
              <Play className={`w-3 h-3 fill-current ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Memindai...' : 'Pindai Perubahan'}</span>
            </button>
          </div>

          {/* Changed Files List */}
          <div className="flex-1 overflow-y-auto divide-y divide-studio-border/50">
            {changedFiles.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs space-y-2">
                <FileCheck className="w-8 h-8 text-gray-500 mx-auto" />
                <p className="font-medium text-gray-300">Tidak ada perubahan terdeteksi.</p>
                <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                  Klik tombol "Pindai Perubahan" untuk memeriksa file baru atau modifikasi pada project.
                </p>
              </div>
            ) : (
              changedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-2.5 flex items-center justify-between hover:bg-studio-card/80 transition-colors text-xs"
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    {getFileIcon(file.path)}
                    <div className="truncate">
                      <p className="font-medium text-gray-200 truncate leading-snug">
                        {file.path.split('/').pop()}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate leading-none mt-0.5">
                        {file.path}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-[10px] text-gray-400 font-mono">
                      {file.size_mb >= 1024
                        ? `${(file.size_mb / 1024).toFixed(1)} GB`
                        : `${file.size_mb.toFixed(1)} MB`}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                        file.state === 'Baru'
                          ? 'bg-studio-green-subtle text-studio-green-text border-studio-green-border'
                          : file.state === 'Diubah'
                          ? 'bg-studio-blue-subtle text-studio-blue-light border-studio-blue-border'
                          : 'bg-studio-card text-gray-400 border-studio-border'
                      }`}
                    >
                      {file.state}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Commit Box (GitHub Desktop Style) */}
          <form
            onSubmit={handleCommitSubmit}
            className="p-3.5 border-t border-studio-border bg-studio-bg space-y-2.5"
          >
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-gray-300 block">
                Simpan Versi Baru (Snapshot)
              </label>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Ringkasan revisi (contoh: Animasi intro logo selesai)..."
                required
                className="w-full px-3 py-1.5 rounded-lg bg-studio-surface border border-studio-border focus:border-studio-blue-light focus:outline-none text-xs text-gray-100 placeholder-gray-500 transition-colors"
              />
              <textarea
                value={commitDesc}
                onChange={(e) => setCommitDesc(e.target.value)}
                placeholder="Catatan tambahan (opsional)..."
                rows={2}
                className="w-full px-3 py-1.5 rounded-lg bg-studio-surface border border-studio-border focus:border-studio-blue-light focus:outline-none text-xs text-gray-100 placeholder-gray-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={creatingSnapshot || !commitMessage.trim()}
              className="w-full py-2 px-4 rounded-lg bg-studio-blue hover:bg-studio-blue-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-sm transition-all"
            >
              {creatingSnapshot ? 'Menyimpan Versi...' : 'Simpan Versi ke Snapshot'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Riwayat Versi (History) */}
      {activeTab === 'history' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Search Box */}
          <div className="p-3 border-b border-studio-border bg-studio-bg">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                placeholder="Cari catatan versi..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-studio-surface border border-studio-border focus:border-studio-blue-light focus:outline-none text-xs text-gray-100 placeholder-gray-500"
              />
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto divide-y divide-studio-border/50">
            {filteredSnapshots.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                Belum ada riwayat snapshot yang tersimpan.
              </div>
            ) : (
              filteredSnapshots.map((snap) => {
                const isSelected = selectedSnapshotId === snap.snapshot_id;
                const formattedDate = new Date(snap.created_at).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <button
                    key={snap.snapshot_id}
                    onClick={() => onSelectSnapshot(snap)}
                    className={`w-full text-left p-3.5 transition-colors flex flex-col space-y-1.5 ${
                      isSelected
                        ? 'bg-studio-blue-subtle border-l-2 border-studio-blue'
                        : 'hover:bg-studio-card/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-200 line-clamp-1">
                        {snap.message}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 bg-studio-card px-1.5 py-0.5 rounded border border-studio-border">
                        {snap.snapshot_id.slice(0, 7)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>{snap.author_name}</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span>{formattedDate}</span>
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
