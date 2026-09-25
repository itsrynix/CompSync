import React, { useEffect, useLayoutEffect, useState, useCallback } from "react";
import { ChevronRight, ChevronLeft, X, Check, Sparkles } from "lucide-react";
import { Language, I18N } from "../i18n";

interface Props {
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  language?: Language;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const STEPS_EN = [
  {
    step: 1,
    title: "1. Select Project Folder",
    desc: "Click here to switch active After Effects projects, open folder in Explorer (↗), or integrate a new project folder (+).",
    placement: "bottom-start" as const,
  },
  {
    step: 2,
    title: "2. Device Identity & P2P Sync",
    desc: "Rename your device identity here and select nearby network peers to Pull the latest revisions directly over LAN.",
    placement: "bottom-center" as const,
  },
  {
    step: 3,
    title: "3. After Effects Lock Probe",
    desc: "Monitors whether your .aep project file is currently locked by After Effects, preventing file overwrite collisions.",
    placement: "bottom-end" as const,
  },
  {
    step: 4,
    title: "4. File Changes & History",
    desc: "The left panel shows modified project files (.aep, video, audio). Click any file row to inspect its size and checksum.",
    placement: "right-top" as const,
  },
  {
    step: 5,
    title: "5. Commit Version Snapshot",
    desc: "Enter a revision summary and click 'Commit to Snapshot' to lock your editing progress milestone and sync with peers.",
    placement: "right-bottom" as const,
  },
  {
    step: 6,
    title: "6. Project Files Directory & Filters",
    desc: "Explore all project assets in your workspace. Use category filter chips (AEP, Video, Audio, Images, Other) to filter quickly.",
    placement: "left-top" as const,
  },
];

const STEPS_ID = [
  {
    step: 1,
    title: "1. Pilih & Integrasi Folder Project",
    desc: "Klik menu project ini untuk mengganti project After Effects aktif, membuka folder di Explorer (↗), atau mengintegrasikan folder baru (+).",
    placement: "bottom-start" as const,
  },
  {
    step: 2,
    title: "2. Identitas Perangkat & Tarik P2P",
    desc: "Ubah nama perangkat Anda di sini dan pilih komputer rekan di jaringan lokal (LAN) untuk menarik revisi terbaru secara instan.",
    placement: "bottom-center" as const,
  },
  {
    step: 3,
    title: "3. Deteksi Lock After Effects",
    desc: "CompSync memantau apakah file .aep sedang dibuka oleh After Effects agar proses sinkronisasi aman dan tidak menimpa file yang diedit.",
    placement: "bottom-end" as const,
  },
  {
    step: 4,
    title: "4. Perubahan File & Riwayat",
    desc: "Panel kiri menampilkan file yang diubah atau baru. Klik salah satu baris file untuk melihat detail ukuran dan checksum.",
    placement: "right-top" as const,
  },
  {
    step: 5,
    title: "5. Simpan Versi (Snapshot)",
    desc: "Ketik ringkasan revisi lalu klik 'Simpan ke Snapshot' untuk mengunci milestone progres edit Anda dan menyinkronkannya.",
    placement: "right-bottom" as const,
  },
  {
    step: 6,
    title: "6. Direktori File & Filter Aset",
    desc: "Jelajahi seluruh aset di folder project. Gunakan tombol filter kategori (AEP, Video, Audio, Gambar, Lainnya) untuk filter cepat.",
    placement: "left-top" as const,
  },
];

function computeTargetRect(step: number): SpotlightRect | null {
  if (typeof document === "undefined") return null;

  const targetSelector = `[data-tour="step-${step}"]`;
  const el = document.querySelector(targetSelector);
  if (el) {
    const r = el.getBoundingClientRect();
    return {
      top: r.top - 4,
      left: r.left - 4,
      width: r.width + 8,
      height: r.height + 8,
    };
  }

  if (step === 4) {
    const leftPanel = document.querySelector('[data-tour="left-panel"]');
    const form = document.querySelector('[data-tour="step-5"]');
    if (leftPanel) {
      const lr = leftPanel.getBoundingClientRect();
      const formTop = form ? form.getBoundingClientRect().top : lr.top + lr.height * 0.65;
      return {
        top: lr.top + 2,
        left: lr.left + 4,
        width: lr.width - 8,
        height: Math.max(160, formTop - lr.top - 8),
      };
    }
  }

  return null;
}

export const InteractiveTourSpotlight: React.FC<Props> = ({
  currentStep,
  onNext,
  onPrev,
  onClose,
  language = "en",
}) => {
  const [rect, setRect] = useState<SpotlightRect | null>(() =>
    computeTargetRect(currentStep)
  );
  const steps = language === "id" ? STEPS_ID : STEPS_EN;
  const stepInfo = steps.find((s) => s.step === currentStep) || steps[0];
  const t = I18N[language];

  const updateRect = useCallback(() => {
    const r = computeTargetRect(currentStep);
    setRect(r);
  }, [currentStep]);

  useLayoutEffect(() => {
    updateRect();
  }, [updateRect]);

  useEffect(() => {
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [updateRect]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        if (currentStep < steps.length) onNext();
        else onClose();
      }
      if (e.key === "ArrowLeft" && currentStep > 1) {
        onPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, onNext, onPrev, onClose, steps.length]);

  const getTooltipStyle = (): React.CSSProperties => {
    const cardWidth = 360;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
    const vh = typeof window !== "undefined" ? window.innerHeight : 720;

    if (!rect) {
      return {
        top: 80,
        left: 24,
        width: cardWidth,
        opacity: 0,
        pointerEvents: "none",
      };
    }

    const { placement } = stepInfo;

    if (placement === "bottom-start") {
      return {
        top: Math.min(vh - 230, rect.top + rect.height + 16),
        left: Math.max(16, rect.left),
        width: cardWidth,
      };
    }

    if (placement === "bottom-center") {
      const centerLeft = rect.left + rect.width / 2 - cardWidth / 2;
      return {
        top: Math.min(vh - 230, rect.top + rect.height + 16),
        left: Math.max(16, Math.min(vw - cardWidth - 16, centerLeft)),
        width: cardWidth,
      };
    }

    if (placement === "bottom-end") {
      return {
        top: Math.min(vh - 230, rect.top + rect.height + 16),
        left: Math.max(16, Math.min(vw - cardWidth - 16, rect.left + rect.width - cardWidth)),
        width: cardWidth,
      };
    }

    if (placement === "right-top") {
      return {
        top: Math.max(64, rect.top + 12),
        left: Math.min(vw - cardWidth - 20, rect.left + rect.width + 20),
        width: cardWidth,
      };
    }

    if (placement === "right-bottom") {
      return {
        top: Math.max(64, rect.top - 10),
        left: Math.min(vw - cardWidth - 20, rect.left + rect.width + 20),
        width: cardWidth,
      };
    }

    // left-top
    return {
      top: Math.min(vh - 230, rect.top + 20),
      left: Math.max(20, rect.left + 24),
      width: cardWidth,
    };
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto">
      <div
        className="fixed inset-0 bg-transparent"
        onClick={onClose}
        title="Click outside to close"
      />

      {rect && (
        <div
          className="fixed rounded-xl pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow:
              "0 0 0 9999px rgba(0, 0, 0, 0.76), 0 0 28px rgba(20, 115, 230, 0.55)",
            border: "2px solid var(--studio-blue)",
          }}
        />
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        style={getTooltipStyle()}
        className="fixed z-50 bg-studio-surface border border-studio-border rounded-2xl shadow-2xl p-5 select-none transition-all duration-300 ease-out"
      >
        <div className="flex items-center justify-between pb-3 border-b border-studio-border">
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: "var(--studio-blue)" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-[14px] text-gray-100">
              {stepInfo.title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-gray-300 py-3.5 leading-relaxed text-[13px]">
          {stepInfo.desc}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-studio-border">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 text-xs font-medium transition-colors"
            >
              {t.tourSkip}
            </button>

            <div className="flex items-center gap-1.5">
              {steps.map((s) => (
                <span
                  key={s.step}
                  className={`h-1.5 rounded-full transition-all ${
                    s.step === currentStep
                      ? "w-4 bg-studio-blue"
                      : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={currentStep === 1}
              className={`p-1.5 rounded-lg border border-studio-border transition-colors ${
                currentStep === 1
                  ? "opacity-30 cursor-not-allowed text-gray-500"
                  : "hover:bg-studio-card text-gray-300 hover:text-white"
              }`}
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={currentStep === steps.length ? onClose : onNext}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-studio-blue hover:bg-studio-blue-hover text-white font-semibold text-xs shadow-md transition-colors"
            >
              <span>
                {currentStep === steps.length
                  ? t.tourFinish
                  : `${t.tourNext} (${currentStep}/${steps.length})`}
              </span>
              {currentStep === steps.length ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
