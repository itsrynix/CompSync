import React, { useState } from "react";
import { FolderOpen, Link2, Plus, X } from "lucide-react";
import { Language } from "../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  selectedPath: string;
  onSelectFolder: () => Promise<void>;
  onCreate: (path: string) => Promise<void>;
  onJoin: (path: string, pairingCode: string) => Promise<void>;
}

export const ProjectSetupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  language,
  selectedPath,
  onSelectFolder,
  onCreate,
  onJoin,
}) => {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [pairingCode, setPairingCode] = useState("");
  const [busy, setBusy] = useState(false);
  const isIndonesian = language === "id";

  if (!isOpen) return null;

  const submit = async () => {
    if (!selectedPath || busy) return;
    setBusy(true);
    try {
      if (mode === "create") {
        await onCreate(selectedPath);
      } else if (pairingCode.trim()) {
        await onJoin(selectedPath, pairingCode.trim());
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-studio-border bg-studio-surface p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-studio-text-primary">
              {isIndonesian ? "Siapkan Project" : "Set Up Project"}
            </h2>
            <p className="mt-1 text-xs text-studio-text-muted">
              {isIndonesian ? "Pilih folder dan tentukan cara menghubungkannya." : "Choose a folder and decide how to connect it."}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-studio-text-muted hover:bg-white/[0.08] hover:text-white" title="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onSelectFolder}
          className="mt-5 flex w-full items-center gap-3 rounded-lg border border-dashed border-studio-border bg-studio-bg p-3 text-left transition-colors hover:border-studio-blue hover:bg-studio-card"
        >
          <FolderOpen className="h-5 w-5 shrink-0 text-studio-blue-light" />
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-studio-text-muted">{isIndonesian ? "Folder lokal" : "Local folder"}</span>
            <span className="mt-1 block truncate text-xs font-medium text-studio-text-primary">{selectedPath || (isIndonesian ? "Pilih folder project..." : "Choose a project folder...")}</span>
          </span>
        </button>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-xs font-semibold transition-colors ${mode === "create" ? "border-studio-blue bg-studio-blue/15 text-studio-blue-light" : "border-studio-border bg-studio-card text-studio-text-secondary hover:text-studio-text-primary"}`}
          >
            <Plus className="h-4 w-4" />
            <span>{isIndonesian ? "Buat Baru" : "Create New"}</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("join")}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-xs font-semibold transition-colors ${mode === "join" ? "border-studio-blue bg-studio-blue/15 text-studio-blue-light" : "border-studio-border bg-studio-card text-studio-text-secondary hover:text-studio-text-primary"}`}
          >
            <Link2 className="h-4 w-4" />
            <span>{isIndonesian ? "Link Project" : "Link Existing"}</span>
          </button>
        </div>

        {mode === "join" && (
          <label className="mt-4 block text-[11px] font-medium text-studio-text-secondary">
            {isIndonesian ? "Pairing code / Project ID" : "Pairing code / Project ID"}
            <input
              value={pairingCode}
              onChange={(event) => setPairingCode(event.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="mt-1 w-full rounded-lg border border-studio-border bg-studio-bg px-3 py-2 font-mono text-xs text-studio-text-primary outline-none focus:border-studio-blue"
            />
          </label>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-studio-border px-4 py-2 text-xs text-studio-text-secondary hover:bg-studio-card">
            {isIndonesian ? "Batal" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy || !selectedPath || (mode === "join" && !pairingCode.trim())}
            className="rounded-lg bg-studio-blue px-4 py-2 text-xs font-semibold text-white hover:bg-studio-blue-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (isIndonesian ? "Memproses..." : "Working...") : mode === "create" ? isIndonesian ? "Buat Project" : "Create Project" : isIndonesian ? "Link Project" : "Link Project"}
          </button>
        </div>
      </div>
    </div>
  );
};
