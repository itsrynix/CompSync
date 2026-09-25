import React from 'react';
import { ChevronRight, ChevronLeft, X, Check } from 'lucide-react';

interface Props {
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

const STEPS = [
  {
    step: 1,
    title: '1. Pilih Folder Project',
    desc: 'Di header kiri, periksa folder project aktif Anda atau klik "Ganti" untuk berpindah ke project After Effects lainnya.',
  },
  {
    step: 2,
    title: '2. Identitas Perangkat & Push/Pull',
    desc: 'Di header tengah, Anda bisa mengubah (rename) nama perangkat Anda. CompSync otomatis menampilkan perangkat mitra (contoh: Laptop-Adrian) untuk Tarik (Pull) data.',
  },
  {
    step: 3,
    title: '3. Deteksi Lock After Effects',
    desc: 'Indikator di kanan atas memantau apakah file .aep sedang aktif dibuka oleh After Effects untuk mencegah tabrakan edit file.',
  },
  {
    step: 4,
    title: '4. Perubahan File & Detail',
    desc: 'Panel kiri menampilkan file yang diubah atau baru. Klik salah satu file untuk melihat rincian ukuran dan statusnya di panel kanan.',
  },
  {
    step: 5,
    title: '5. Simpan Versi (Snapshot)',
    desc: 'Tulis ringkasan revisi di bagian bawah panel kiri lalu klik "Simpan Versi ke Snapshot" untuk mengunci milestone progres edit Anda.',
  },
  {
    step: 6,
    title: '6. Akses Cepat Aset Folder',
    desc: 'Gunakan baris tombol cepat di atas panel kanan untuk membuka file .aep, folder Footage, atau folder Audio langsung di File Explorer.',
  },
];

export const InteractiveTourSpotlight: React.FC<Props> = ({
  currentStep,
  onNext,
  onPrev,
  onClose,
}) => {
  const stepInfo = STEPS.find((s) => s.step === currentStep) || STEPS[0];

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-studio-surface border border-studio-blue-border rounded-xl shadow-2xl p-4 text-xs select-none animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-studio-border">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-studio-blue-light" />
          <span className="font-semibold text-studio-text-primary">{stepInfo.title}</span>
        </div>
        <div className="flex items-center space-x-2 text-studio-text-muted">
          <span className="text-[10px] font-mono">
            {stepInfo.step} / {STEPS.length}
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:text-studio-text-primary rounded hover:bg-studio-card transition-colors"
            title="Tutup Petunjuk"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-studio-text-secondary py-3 leading-relaxed text-xs">
        {stepInfo.desc}
      </p>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-studio-borderSubtle">
        <button
          onClick={onClose}
          className="text-studio-text-muted hover:text-studio-text-secondary text-[11px] transition-colors"
        >
          Lewati
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={onPrev}
            disabled={currentStep === 1}
            className={`p-1.5 rounded border border-studio-border transition-colors ${
              currentStep === 1
                ? 'opacity-30 cursor-not-allowed text-studio-text-muted'
                : 'hover:bg-studio-card text-studio-text-secondary hover:text-studio-text-primary'
            }`}
            title="Langkah Sebelumnya"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={currentStep === STEPS.length ? onClose : onNext}
            className="flex items-center space-x-1 px-3 py-1.5 rounded bg-studio-blue hover:bg-studio-blue-hover text-white font-medium text-xs shadow-sm transition-colors"
          >
            <span>{currentStep === STEPS.length ? 'Selesai' : 'Lanjut'}</span>
            {currentStep === STEPS.length ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
