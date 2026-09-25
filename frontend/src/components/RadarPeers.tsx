import React from 'react';
import { PeerInfo } from '../types';
import { Wifi, ArrowDownLeft, Laptop, Monitor, ShieldCheck, AlertCircle } from 'lucide-react';

interface Props {
  peers: PeerInfo[];
  onPull: (peer: PeerInfo) => void;
  syncingPeer: string | null;
}

export const RadarPeers: React.FC<Props> = ({ peers, onPull, syncingPeer }) => {
  return (
    <div className="bg-studio-surface border border-studio-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Wifi className="w-5 h-5 text-indigo-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          </div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            LAN Workstations ({peers.length})
          </h2>
        </div>
        <span className="text-[11px] text-gray-400">Zero-Config P2P Active</span>
      </div>

      {peers.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-studio-border rounded-xl bg-studio-bg/50">
          <Laptop className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-50" />
          <p className="text-xs text-gray-300 font-medium">Scanning for Workstations...</p>
          <p className="text-[11px] text-gray-500 mt-1 max-w-xs mx-auto">
            Open CompSync on your Desktop or Laptop in the same Wi-Fi/LAN network to auto-pair.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {peers.map((peer) => {
            const isSyncing = syncingPeer === peer.device_id;
            return (
              <div
                key={peer.device_id}
                className="bg-studio-card border border-studio-border rounded-xl p-3.5 flex items-center justify-between hover:border-gray-500/50 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-semibold text-gray-100">{peer.device_name}</h3>
                      {peer.is_locked ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Editing in AE</span>
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Synced / Free</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                      {peer.ip_addr}:{peer.tcp_port}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onPull(peer)}
                  disabled={isSyncing}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSyncing
                      ? 'bg-indigo-600/50 text-white cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95'
                  }`}
                >
                  <ArrowDownLeft className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Pull Changes'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
