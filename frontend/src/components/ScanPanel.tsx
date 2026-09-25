import React from 'react';
import { ScanResultDto } from '../types';
import { Zap, Gauge, FileCheck2, Clock, Play } from 'lucide-react';

interface Props {
  scanResult: ScanResultDto | null;
  onScan: () => void;
  scanning: boolean;
}

export const ScanPanel: React.FC<Props> = ({ scanResult, onScan, scanning }) => {
  return (
    <div className="bg-studio-surface border border-studio-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Fast Working Tree Diff
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            BLAKE3 SIMD Tree Hashing with SQLite WAL Cache
          </p>
        </div>
        <button
          onClick={onScan}
          disabled={scanning}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Scanning Files...' : 'Scan Project Tree'}</span>
        </button>
      </div>

      {scanResult && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-studio-card border border-studio-border rounded-xl p-3">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Duration</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-base font-bold text-white font-mono">{scanResult.duration_ms} ms</span>
            </div>
          </div>

          <div className="bg-studio-card border border-studio-border rounded-xl p-3">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Throughput</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <Gauge className="w-4 h-4 text-indigo-400" />
              <span className="text-base font-bold text-white font-mono">
                {scanResult.throughput_gbps > 0 ? `${scanResult.throughput_gbps.toFixed(2)} GB/s` : 'Instant'}
              </span>
            </div>
          </div>

          <div className="bg-studio-card border border-studio-border rounded-xl p-3">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Cache Hits</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-base font-bold text-white font-mono">
                {scanResult.cached_files} / {scanResult.total_files}
              </span>
            </div>
          </div>

          <div className="bg-studio-card border border-studio-border rounded-xl p-3">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Total Volume</span>
            <div className="flex items-center space-x-1.5 mt-1">
              <FileCheck2 className="w-4 h-4 text-purple-400" />
              <span className="text-base font-bold text-white font-mono">
                {(scanResult.total_mb / 1024).toFixed(2)} GB
              </span>
            </div>
          </div>
        </div>
      )}

      {scanResult ? (
        <div className="max-h-56 overflow-y-auto rounded-xl border border-studio-border bg-studio-bg divide-y divide-studio-border/50 text-xs">
          {scanResult.files.map((file, idx) => (
            <div key={idx} className="px-3.5 py-2 flex items-center justify-between hover:bg-studio-card/40">
              <div className="flex items-center space-x-2.5 truncate pr-4">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    file.state === 'Modified'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : file.state === 'Added'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {file.state.toUpperCase()}
                </span>
                <span className="font-mono text-gray-200 truncate">{file.path}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 shrink-0 font-mono text-[11px]">
                <span>{file.size_mb > 1024 ? `${(file.size_mb / 1024).toFixed(2)} GB` : `${file.size_mb.toFixed(1)} MB`}</span>
                <span className="text-gray-500 bg-studio-card px-1.5 py-0.5 rounded border border-studio-border">
                  {file.hash_short}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 text-xs bg-studio-bg rounded-xl border border-studio-border">
          Click "Scan Project Tree" to inspect working directory state.
        </div>
      )}
    </div>
  );
};
