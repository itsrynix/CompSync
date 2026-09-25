import React, { useState } from "react";
import { Check, Copy, KeyRound, X } from "lucide-react";
import { PairingInfo } from "../types";
import { Language } from "../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pairingInfo: PairingInfo | null;
  language: Language;
}

export const PairingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  pairingInfo,
  language,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !pairingInfo) return null;

  const copyCode = async () => {
    await navigator.clipboard.writeText(pairingInfo.pairing_code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const isIndonesian = language === "id";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-studio-border bg-studio-surface p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-studio-blue-border bg-studio-blue/15 text-studio-blue-light">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-studio-text-primary">
                {isIndonesian ? "Pasangkan Komputer" : "Pair Another Computer"}
              </h2>
              <p className="mt-0.5 text-[11px] text-studio-text-muted">
                {pairingInfo.project_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-studio-text-muted transition-colors hover:bg-white/[0.08] hover:text-white"
            title={isIndonesian ? "Tutup" : "Close"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-studio-text-secondary">
          {isIndonesian
            ? "Masukkan kode ini di komputer lain melalui menu Join Existing Project."
            : "Enter this code on the other computer using Join Existing Project."}
        </p>

        <div className="mt-3 flex items-center gap-2 rounded-lg border border-studio-border bg-studio-bg p-2">
          <code className="min-w-0 flex-1 break-all px-2 font-mono text-xs text-studio-blue-light">
            {pairingInfo.pairing_code}
          </code>
          <button
            onClick={copyCode}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-studio-border bg-studio-card px-2.5 py-1.5 text-[11px] font-medium text-studio-text-secondary transition-colors hover:bg-studio-cardHover hover:text-white"
            title={isIndonesian ? "Salin kode" : "Copy code"}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? (isIndonesian ? "Tersalin" : "Copied") : isIndonesian ? "Salin" : "Copy"}</span>
          </button>
        </div>

        <p className="mt-3 text-[10px] leading-relaxed text-studio-text-muted">
          {isIndonesian
            ? "Kode ini menyamakan identitas project, bukan menyalin file project. Transfer file dilakukan setelah kedua komputer terhubung di LAN."
            : "This code pairs the project identity; it does not copy project files. Files transfer after both computers connect on LAN."}
        </p>
      </div>
    </div>
  );
};
