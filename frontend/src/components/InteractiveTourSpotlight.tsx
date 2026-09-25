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
    desc: 'Klik tombol "Ganti Folder..." pada navigasi atas untuk memilih folder tempat file .aep dan aset footage Anda berada.',
  },
  {
    step: 2,
    title: '2. Deteksi Lock File After Effects',
    desc: 'Perhatikan badge status di tengah atas. CompSync otomatis mendeteksi jika AfterFX.exe sedang membuka file Anda untuk mencegah kerusakan file.',
  },
  {
    step: 3,
    title: '3. Pindai Perubahan File (Changes)',
    desc: 'Di tab "Perubahan File" pada panel kiri, klik "Pindai Perubahan" untuk memindai file video, audio, dan aset yang baru atau diedit.',
  },
  {
    step: 4,
    title: '4. Simpan Versi (Snapshot Commit)',
    desc: 'Di bagian bawah panel kiri, tulis ringkasan revisi Anda dan klik "Simpan Versi ke Snapshot" untuk mengunci milestone progres kerja.',
  },
  {
    step: 5,
    title: '5. Sinkronisasi Antar Komputer (LAN P2P)',
    desc: 'Pada panel kanan, perangkat lain di jaringan Wi-Fi lokal akan terdeteksi otomatis. Klik "Tarik Versi" untuk menyalin file langsung tanpa internet.',
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
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-studio-surface border border-studio-blue-border rounded-xl shadow-2xl p-4 text-xs select-none animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-studio-border">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-studio-blue-light" />
          <span className="font-semibold text-gray-100">{stepInfo.title}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <span className="text-[11px] font-mono">
            {stepInfo.step} / {STEPS.length}
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:text-white rounded hover:bg-studio-card transition-colors"
            title="Tutup Petunjuk"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 py-3 leading-relaxed text-xs">
        {stepInfo.desc}
      </p>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-studio-border/60">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200 text-[11px] transition-colors"
        >
          Lewati Panduan
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={onPrev}
            disabled={currentStep === 1}
            className={`p-1.5 rounded border border-studio-border transition-colors ${
              currentStep === 1
                ? 'opacity-30 cursor-not-allowed text-gray-600'
                : 'hover:bg-studio-card text-gray-300 hover:text-white'
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
