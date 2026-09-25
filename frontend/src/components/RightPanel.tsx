import React from 'react';
import { PeerInfo, SnapshotSummaryDto, RepoStatusDto } from '../types';
import {
  Wifi,
  Laptop,
  Folder,
  Layers,
  ArrowDownLeft,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  HardDrive,
  FileCode,
  FileVideo,
  Music,
} from 'lucide-react';

interface Props {
  peers: PeerInfo[];
  projectPath: string;
  status: RepoStatusDto | null;
  onPull: (peer: PeerInfo) => void;
  syncingPeer: string | null;
  onOpenFolder: (subPath?: string) => void;
  selectedSnapshot: SnapshotSummaryDto | null;
}

export const RightPanel: React.FC<Props> = ({
  peers,
  projectPath,
  status,
  onPull,
  syncingPeer,
  onOpenFolder,
  selectedSnapshot,
}) => {
  return (
    <div className="flex flex-col h-full bg-studio-bg overflow-y-auto p-5 space-y-5 select-none">
      {/* Selected Snapshot Inspector (if user clicked one from History tab) */}
      {selectedSnapshot && (
        <div className="bg-studio-surface border border-studio-blue-border rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-studio-blue-light tracking-wider">
              Detail Snapshot Terpilih
            </span>
            <span className="text-xs font-mono text-gray-400 bg-studio-card px-2 py-0.5 rounded border border-studio-border">
              {selectedSnapshot.snapshot_id}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-gray-100">{selectedSnapshot.message}</h3>
          <div className="flex items-center space-x-4 text-xs text-gray-400 pt-1">
            <span>Dibuat oleh: <strong className="text-gray-200">{selectedSnapshot.author_name}</strong></span>
            <span>Total: <strong className="text-gray-200">{selectedSnapshot.total_files} file ({(selectedSnapshot.total_mb / 1024).toFixed(1)} GB)</strong></span>
          </div>
        </div>
      )}

      {/* Section 1: Perangkat Terhubung (LAN Workstations) */}
      <div className="bg-studio-surface border border-studio-border rounded-xl p-4.5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-studio-blue-light" />
            <h2 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
              Perangkat Terhubung di Jaringan (LAN)
            </h2>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">
            {peers.length} perangkat terdeteksi
          </span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          CompSync otomatis mendeteksi PC dan laptop lain di jaringan Wi-Fi lokal untuk sinkronisasi peer-to-peer tanpa internet.
        </p>

        {/* Peer List */}
        {peers.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-studio-border rounded-xl bg-studio-card/30">
            <Laptop className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-60" />
            <p className="text-xs font-medium text-gray-300">
              Sedang memindai perangkat lain di jaringan Wi-Fi...
            </p>
            <p className="text-[11px] text-gray-500 mt-1 max-w-sm mx-auto">
              Buka CompSync di laptop atau PC kedua Anda pada jaringan yang sama untuk melakukan sinkronisasi otomatis.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {peers.map((peer) => {
              const isSyncing = syncingPeer === peer.device_id;
              return (
                <div
                  key={peer.device_id}
                  className="bg-studio-card border border-studio-border rounded-xl p-3.5 flex items-center justify-between hover:border-gray-500 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-studio-surface border border-studio-border flex items-center justify-center text-studio-blue-light">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-100">{peer.device_name}</h4>
                      <p className="text-[11px] text-gray-400 font-mono">
                        {peer.ip_addr}:{peer.tcp_port}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onPull(peer)}
                    disabled={isSyncing}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-studio-blue hover:bg-studio-blue-hover text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <ArrowDownLeft className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
                    <span>{isSyncing ? 'Menarik Data...' : 'Tarik Versi (Sync)'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Struktur Folder & Aset Project Terintegrasi */}
      <div className="bg-studio-surface border border-studio-border rounded-xl p-4.5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Folder className="w-4 h-4 text-studio-blue-light" />
            <h2 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
              Aset & Folder Project Terintegrasi
            </h2>
          </div>
          <button
            onClick={() => onOpenFolder()}
            className="flex items-center space-x-1 text-xs text-studio-blue-light hover:underline font-medium"
          >
            <span>Buka Folder Utama</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Folder project saat ini: <code className="text-gray-200 font-mono bg-studio-card px-1.5 py-0.5 rounded">{projectPath}</code>
        </p>

        {/* Directory Items List */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* AEP File */}
          <button
            onClick={() => onOpenFolder()}
            className="p-3 bg-studio-card border border-studio-border hover:border-gray-500 rounded-lg text-left transition-colors group flex items-start space-x-2.5"
          >
            <Layers className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-gray-200 block truncate">
                {status?.aep_files[0]?.file_name || 'Project After Effects'}
              </span>
              <span className="text-[10px] text-gray-500 block truncate">
                File project utama (.aep)
              </span>
            </div>
          </button>

          {/* Footage Folder */}
          <button
            onClick={() => onOpenFolder('Footage')}
            className="p-3 bg-studio-card border border-studio-border hover:border-gray-500 rounded-lg text-left transition-colors group flex items-start space-x-2.5"
          >
            <FileVideo className="w-4 h-4 text-studio-blue-light flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-gray-200 block truncate">
                Folder Footage / Video
              </span>
              <span className="text-[10px] text-gray-500 block truncate">
                4K, ProRes, B-Roll, Animatic
              </span>
            </div>
          </button>

          {/* Audio Folder */}
          <button
            onClick={() => onOpenFolder('Audio')}
            className="p-3 bg-studio-card border border-studio-border hover:border-gray-500 rounded-lg text-left transition-colors group flex items-start space-x-2.5"
          >
            <Music className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-gray-200 block truncate">
                Folder Audio / Voice Over
              </span>
              <span className="text-[10px] text-gray-500 block truncate">
                WAV, MP3, Backsound, Sound FX
              </span>
            </div>
          </button>

          {/* CompSync Database */}
          <button
            onClick={() => onOpenFolder('.compsync')}
            className="p-3 bg-studio-card border border-studio-border hover:border-gray-500 rounded-lg text-left transition-colors group flex items-start space-x-2.5"
          >
            <FileCode className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-gray-200 block truncate">
                Database Versi (.compsync)
              </span>
              <span className="text-[10px] text-gray-500 block truncate">
                SQLite cache & snapshot manifest
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
