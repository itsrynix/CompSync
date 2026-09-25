import React from 'react';
import { SnapshotSummaryDto, RepoStatusDto, ScannedFileDto } from '../types';
import {
  Folder,
  Layers,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileVideo,
  Music,
  FileCode,
  FileText,
  Clock,
  HardDrive,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';

interface Props {
  projectPath: string;
  status: RepoStatusDto | null;
  onOpenFolder: (subPath?: string) => void;
  selectedFile: ScannedFileDto | null;
  selectedSnapshot: SnapshotSummaryDto | null;
  myDeviceName: string;
}

export const RightPanel: React.FC<Props> = ({
  projectPath,
  status,
  onOpenFolder,
  selectedFile,
  selectedSnapshot,
  myDeviceName,
}) => {
  const primaryAep = status?.aep_files?.[0];
  const isAepLocked = primaryAep?.lock?.is_locked;

  const getFileIcon = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    if (ext === 'aep') return <Layers className="w-5 h-5 text-purple-400" />;
    if (['mov', 'mp4', 'avi', 'mkv', 'mxf', 'prores'].includes(ext || ''))
      return <FileVideo className="w-5 h-5 text-studio-blue-light" />;
    if (['wav', 'mp3', 'aac', 'cfa'].includes(ext || ''))
      return <Music className="w-5 h-5 text-studio-green-text" />;
    if (['png', 'jpg', 'jpeg', 'psd', 'ai', 'exr'].includes(ext || ''))
      return <FileText className="w-5 h-5 text-amber-400" />;
    return <FileCode className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="flex flex-col h-full bg-studio-bg overflow-hidden select-none">
      {/* 1. Horizontal Row: Aset & Folder Terintegrasi (Baris Ramping) */}
      <div className="border-b border-studio-border px-4 py-2 bg-studio-sidebar/50 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-studio-text-muted">
            Aset Folder:
          </span>

          {/* Row item: AEP */}
          <button
            onClick={() => onOpenFolder(status?.aep_files[0]?.file_name || '')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-studio-card hover:bg-studio-cardHover border border-studio-border text-xs text-studio-text-primary transition-colors flex-shrink-0"
            title="Buka file project After Effects (.aep)"
          >
            <Layers className="w-3 h-3 text-purple-400" />
            <span className="font-medium max-w-[130px] truncate">
              {status?.aep_files[0]?.file_name || 'Project.aep'}
            </span>
          </button>

          {/* Row item: Footage */}
          <button
            onClick={() => onOpenFolder('Footage')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-studio-card hover:bg-studio-cardHover border border-studio-border text-xs text-studio-text-secondary hover:text-studio-text-primary transition-colors flex-shrink-0"
            title="Buka folder Footage / Video di Explorer"
          >
            <FileVideo className="w-3 h-3 text-studio-blue-light" />
            <span>Footage</span>
          </button>

          {/* Row item: Audio */}
          <button
            onClick={() => onOpenFolder('Audio')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-studio-card hover:bg-studio-cardHover border border-studio-border text-xs text-studio-text-secondary hover:text-studio-text-primary transition-colors flex-shrink-0"
            title="Buka folder Audio / VO di Explorer"
          >
            <Music className="w-3 h-3 text-studio-green-text" />
            <span>Audio</span>
          </button>

          {/* Row item: .compsync */}
          <button
            onClick={() => onOpenFolder('.compsync')}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-studio-card hover:bg-studio-cardHover border border-studio-border text-xs text-studio-text-secondary hover:text-studio-text-primary transition-colors flex-shrink-0"
            title="Buka database cache CompSync"
          >
            <FileCode className="w-3 h-3 text-amber-400" />
            <span>.compsync</span>
          </button>
        </div>

        {/* Action: Open main project root */}
        <button
          onClick={() => onOpenFolder()}
          className="flex items-center space-x-1 text-xs text-studio-text-muted hover:text-studio-text-primary transition-colors flex-shrink-0 ml-auto"
          title="Buka root folder project di Windows Explorer"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px]">Buka Root</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* 2. Main Workspace: Detail & Inspector */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {selectedFile ? (
          /* File Inspector View */
          <div className="space-y-4">
            <div className="bg-studio-surface border border-studio-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded bg-studio-card border border-studio-border">
                    {getFileIcon(selectedFile.path)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-studio-text-primary">
                      {selectedFile.path.split('/').pop()}
                    </h3>
                    <p className="text-xs text-studio-text-muted font-mono mt-0.5">
                      {selectedFile.path}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs px-2.5 py-0.5 rounded font-medium border ${
                    selectedFile.state === 'Baru'
                      ? 'bg-studio-green-subtle text-studio-green-text border-studio-green-border'
                      : selectedFile.state === 'Diubah'
                      ? 'bg-studio-blue-subtle text-studio-blue-light border-studio-blue-border'
                      : 'bg-studio-card text-studio-text-secondary border-studio-border'
                  }`}
                >
                  {selectedFile.state}
                </span>
              </div>

              {/* File Specs Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-xs border-t border-studio-borderSubtle">
                <div>
                  <span className="text-[10px] uppercase font-bold text-studio-text-muted block">
                    Ukuran File
                  </span>
                  <span className="font-mono text-studio-text-primary text-xs mt-0.5 block">
                    {selectedFile.size_mb >= 1024
                      ? `${(selectedFile.size_mb / 1024).toFixed(2)} GB`
                      : `${selectedFile.size_mb.toFixed(1)} MB`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-studio-text-muted block">
                    Checksum Singkat
                  </span>
                  <span className="font-mono text-studio-text-secondary text-xs mt-0.5 block">
                    {selectedFile.hash_short || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-studio-text-muted block">
                    Status Sinkron
                  </span>
                  <span className="text-studio-text-primary text-xs mt-0.5 block">
                    {selectedFile.state === 'Tersimpan' ? 'Sesuai Snapshot' : 'Perlu Disimpan'}
                  </span>
                </div>
              </div>

              {/* Specific info for AEP file */}
              {selectedFile.path.endsWith('.aep') && (
                <div
                  className={`mt-3 p-3 rounded border text-xs flex items-center justify-between ${
                    isAepLocked
                      ? 'bg-studio-red-subtle border-studio-red-border text-studio-red-text'
                      : 'bg-studio-green-subtle border-studio-green-border text-studio-green-text'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {isAepLocked ? (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>
                      {isAepLocked
                        ? `File sedang terbuka di After Effects (${primaryAep?.lock?.process_name || 'AfterFX.exe'}). Harap simpan revisi (Ctrl+S) di AE.`
                        : 'File project bebas dari lock proses. Siap dibuat snapshot atau dikirim ke perangkat lain.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center space-x-2">
                <button
                  onClick={() => onOpenFolder(selectedFile.path)}
                  className="px-3 py-1.5 rounded bg-studio-card hover:bg-studio-cardHover border border-studio-border text-xs text-studio-text-primary transition-colors flex items-center space-x-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Buka di Folder</span>
                </button>
              </div>
            </div>
          </div>
        ) : selectedSnapshot ? (
          /* Snapshot Detail View */
          <div className="space-y-4">
            <div className="bg-studio-surface border border-studio-border rounded-lg p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-studio-blue-light uppercase tracking-wider">
                    Snapshot ID: {selectedSnapshot.snapshot_id}
                  </span>
                  <h3 className="text-base font-semibold text-studio-text-primary mt-1">
                    {selectedSnapshot.message}
                  </h3>
                </div>

                <div className="flex items-center space-x-1 text-xs text-studio-text-muted bg-studio-sidebar px-2.5 py-1 rounded border border-studio-border">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(selectedSnapshot.created_at).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-studio-borderSubtle">
                <div>
                  <span className="text-[10px] uppercase font-bold text-studio-text-muted block">
                    Perangkat / Pembuat
                  </span>
                  <span className="text-studio-text-primary font-medium mt-0.5 block">
                    {selectedSnapshot.author_name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-studio-text-muted block">
                    Total Aset Terkunci
                  </span>
                  <span className="text-studio-text-primary font-medium mt-0.5 block">
                    {selectedSnapshot.total_files} file ({(selectedSnapshot.total_mb / 1024).toFixed(1)} GB)
                  </span>
                </div>
              </div>

              <div className="p-3 bg-studio-sidebar border border-studio-border rounded text-xs text-studio-text-secondary leading-relaxed">
                Snapshot ini merekam seluruh kondisi file project After Effects dan aset video pada saat disimpan. Anda dapat menggunakan snapshot ini sebagai titik pemulihan.
              </div>
            </div>
          </div>
        ) : (
          /* Default Clean State */
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-studio-surface border border-studio-border flex items-center justify-center text-studio-text-muted">
              <Layers className="w-6 h-6 text-studio-blue-light opacity-80" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-studio-text-primary">
                Area Detail & Pemeriksaan File
              </h4>
              <p className="text-[11px] text-studio-text-muted max-w-sm mt-1 leading-relaxed">
                Pilih salah satu file pada tab <strong>Perubahan File</strong> untuk melihat status dan aksinya, atau pilih riwayat versi untuk melihat detail commit.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => onOpenFolder()}
                className="px-3 py-1.5 rounded-md bg-studio-card hover:bg-studio-cardHover border border-studio-border text-xs text-studio-text-secondary hover:text-studio-text-primary transition-colors flex items-center space-x-1.5"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Buka Folder Project</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
