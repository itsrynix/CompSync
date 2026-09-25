import React, { useState } from 'react';
import { SnapshotSummaryDto } from '../types';
import { GitCommit, Plus, Clock, User, HardDrive } from 'lucide-react';

interface Props {
  snapshots: SnapshotSummaryDto[];
  onSnapshot: (message: string) => void;
  creating: boolean;
}

export const Timeline: React.FC<Props> = ({ snapshots, onSnapshot, creating }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSnapshot(message.trim());
    setMessage('');
    setIsModalOpen(false);
  };

  return (
    <div className="bg-studio-surface border border-studio-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <GitCommit className="w-5 h-5 text-purple-400" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Version History ({snapshots.length})
          </h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={creating}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-studio-card hover:bg-studio-border border border-studio-border text-white text-xs font-medium transition-all"
        >
          <Plus className="w-4 h-4 text-purple-400" />
          <span>Take Snapshot</span>
        </button>
      </div>

      {snapshots.length === 0 ? (
        <div className="text-center py-6 text-xs text-gray-500 bg-studio-bg rounded-xl border border-studio-border">
          No snapshots recorded yet. Click "Take Snapshot" to save project milestone.
        </div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {snapshots.map((snap) => {
            const dateStr = new Date(snap.created_at).toLocaleString();
            return (
              <div
                key={snap.snapshot_id}
                className="bg-studio-card border border-studio-border rounded-xl p-3.5 hover:border-gray-500/40 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-white">{snap.message}</h3>
                    <div className="flex items-center space-x-3 text-[11px] text-gray-400 mt-1 font-mono">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-gray-500" />
                        <span>{snap.author_name}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span>{dateStr}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <HardDrive className="w-3 h-3 text-gray-500" />
                        <span>
                          {snap.total_files} files ({(snap.total_mb / 1024).toFixed(1)} GB)
                        </span>
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    {snap.snapshot_id.slice(0, 8)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-studio-surface border border-studio-border rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Record Version Snapshot</h3>
            <p className="text-xs text-gray-400 mb-4">
              Write a milestone note describing your recent edits in After Effects.
            </p>
            <form onSubmit={handleSubmit}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Added 3D camera tracker and completed color grading..."
                className="w-full bg-studio-bg border border-studio-border rounded-xl p-3 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 h-24 mb-4 resize-none"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!message.trim() || creating}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/30"
                >
                  {creating ? 'Saving...' : 'Commit Snapshot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
