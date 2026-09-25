import React, { useState } from 'react';
import {
  FolderOpen,
  Lock,
  Zap,
  GitCommit,
  Wifi,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Eye,
  X,
} from 'lucide-react';

export interface TourStep {
  id: number;
  title: string;
  shortTitle: string;
  badge: string;
  icon: React.ReactNode;
  targetArea: string;
  description: string;
  actionInstructions: string[];
  expectedResult: string;
  proTip: string;
}

interface Props {
  activeStep: number;
  onSelectStep: (step: number) => void;
  onClose: () => void;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: 'Langkah 1: Pilih Folder Project After Effects',
    shortTitle: '1. Pilih Folder',
    badge: 'Folder Selection',
    icon: <FolderOpen className="w-4 h-4 text-indigo-400" />,
    targetArea: 'header-folder',
    description:
      'CompSync bekerja langsung di folder lokal tempat file After Effects (.aep) dan aset footage (video, audio, render) Anda berada.',
    actionInstructions: [
      'Klik tombol "Pilih Folder Project..." di baris Header atas.',
      'Jendela Windows Explorer akan terbuka. Arahkan dan pilih folder project After Effects Anda.',
      'Jika folder belum diinisialisasi, klik tombol "Inisialisasi CompSync Sekarang" di kartu yang muncul.',
    ],
    expectedResult:
      'Jalur folder yang Anda pilih akan langsung ditampilkan di baris Header atas dan database lokal CompSync (.compsync) dibuat secara otomatis.',
    proTip:
      'CompSync otomatis mengabaikan After Effects Disk Cache dan Auto-Save agar tidak membebani sinkronisasi.',
  },
  {
    id: 2,
    title: 'Langkah 2: Uji Deteksi File Lock (.aep Lock Inspector)',
    shortTitle: '2. Deteksi Lock AE',
    badge: 'Win32 Lock Probe',
    icon: <Lock className="w-4 h-4 text-rose-400" />,
    targetArea: 'header-lock',
    description:
      'Untuk mencegah file .aep korup saat dipindah atau ditarik antar komputer, CompSync memantau file lock level Win32 secara real-time.',
    actionInstructions: [
      'Buka file .aep yang ada di dalam folder project Anda menggunakan Adobe After Effects.',
      'Klik tombol Refresh (ikon panah memutar di kanan atas) atau tunggu beberapa detik.',
      'Perhatikan badge di kanan atas berubah menjadi warna MERAH berkedip: "TERKUNCI: After Effects".',
      'Sekarang simpan dan tutup Adobe After Effects, lalu klik tombol Refresh lagi.',
    ],
    expectedResult:
      'Badge akan otomatis berubah menjadi warna HIJAU: "AMAN / Unlocked", menandakan project siap disinkronkan tanpa risiko korup.',
    proTip:
      'Fitur ini mencegah Anda menarik revisi baru saat project sedang dibuka dan diedit oleh aplikasi After Effects.',
  },
  {
    id: 3,
    title: 'Langkah 3: Pindai Perubahan File (SIMD BLAKE3 Tree Hashing)',
    shortTitle: '3. Scan Workspace',
    badge: 'High-Speed Hashing',
    icon: <Zap className="w-4 h-4 text-amber-400" />,
    targetArea: 'scan-panel',
    description:
      'CompSync menggunakan SIMD BLAKE3 Tree Hashing paralel yang mampu memindai file video besar (ProRes, 4K MOV, MP4) dengan kecepatan 3+ GB/s.',
    actionInstructions: [
      'Perhatikan panel "Fast Working Tree Diff" di kiri bawah.',
      'Klik tombol "Scan Project Tree" (atau "Run Incremental Scan").',
      'CompSync akan memeriksa perubahan ukuran, timestamp, dan hash kriptografis setiap file.',
    ],
    expectedResult:
      'Daftar file akan muncul dengan status "Added", "Modified", atau "Cached", lengkap dengan kecepatan throughput (GB/s) dan durasi scan (ms).',
    proTip:
      'File yang tidak diubah akan langsung dibaca dari SQLite cache (0 milidetik), sehingga scan ribuan file terasa instan!',
  },
  {
    id: 4,
    title: 'Langkah 4: Simpan Catatan Versi (Git-Style Snapshot Commit)',
    shortTitle: '4. Buat Snapshot',
    badge: 'Version Milestone',
    icon: <GitCommit className="w-4 h-4 text-purple-400" />,
    targetArea: 'timeline-panel',
    description:
      'Rekam milestone atau progres revisi kerja Anda layaknya git commit, lengkap dengan catatan perubahan dan identitas komputer pembuatnya.',
    actionInstructions: [
      'Perhatikan panel "Project Timeline" di sebelah kanan.',
      'Tulis catatan versi di kolom teks (contoh: "Selesai revisi grading warna & animasi logo intro").',
      'Klik tombol "Commit Snapshot".',
    ],
    expectedResult:
      'Snapshot baru akan langsung tercatat di timeline dengan ID snapshot unik, jumlah file, ukuran total, dan jam pencatatan.',
    proTip:
      'Setiap snapshot disimpan dalam format JSON kriptografis di .compsync/objects/snapshots/ sehingga riwayat versi Anda aman dan permanen.',
  },
  {
    id: 5,
    title: 'Langkah 5: Uji Radar & Sinkronisasi LAN P2P',
    shortTitle: '5. Radar LAN P2P',
    badge: 'Zero-Config Networking',
    icon: <Wifi className="w-4 h-4 text-emerald-400" />,
    targetArea: 'radar-panel',
    description:
      'Sinkronisasikan project antar komputer desktop dan laptop di studio/kantor tanpa flashdisk, tanpa upload cloud, dan tanpa kuota internet.',
    actionInstructions: [
      'Perhatikan widget "LAN Workstations" di kiri atas.',
      'CompSync menyiarkan beacon UDP (port 52425) setiap 3 detik.',
      'Jika Anda memiliki laptop kedua di Wi-Fi yang sama, buka CompSync di laptop tersebut.',
      'Workstation lain akan otomatis muncul di radar lengkap dengan tombol "Sync & Pull".',
    ],
    expectedResult:
      'Perangkat lain terdeteksi otomatis. Saat tombol "Sync & Pull" ditekan, file ditransfer dalam chunk 64MB dengan auto-resume jika Wi-Fi terputus.',
    proTip:
      'Transfer peer-to-peer menggunakan batas kecepatan penuh LAN kabel/Wi-Fi Anda (hingga 100+ MB/s) langsung point-to-point!',
  },
];

export const StepGuideTour: React.FC<Props> = ({ activeStep, onSelectStep, onClose }) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const currentTour = TOUR_STEPS.find((s) => s.id === activeStep) || TOUR_STEPS[0];

  const toggleComplete = (id: number) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (activeStep < TOUR_STEPS.length) {
      onSelectStep(activeStep + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 1) {
      onSelectStep(activeStep - 1);
    }
  };

  return (
    <div className="bg-gradient-to-br from-studio-surface via-[#171a26] to-studio-surface border-2 border-indigo-500/40 rounded-2xl p-5 shadow-2xl relative animate-fadeIn mb-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-studio-border">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Panduan Uji Coba & Prosedur Interaktif (Guided Tour)
              </h2>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {completedSteps.length} dari 5 Selesai
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Ikuti urutan langkah di bawah ini untuk menguji seluruh fitur inti CompSync secara bertahap.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-studio-card transition-colors"
          title="Tutup Panduan"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stepper Tabs */}
      <div className="grid grid-cols-5 gap-2 my-4">
        {TOUR_STEPS.map((step) => {
          const isActive = step.id === activeStep;
          const isDone = completedSteps.includes(step.id);

          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(step.id)}
              className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                isActive
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                  : isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-gray-300 hover:border-emerald-500/50'
                  : 'bg-studio-card/80 border-studio-border text-gray-400 hover:border-gray-500 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {step.shortTitle}
                </span>
                {isDone ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-indigo-400 animate-ping' : 'bg-gray-600'
                    }`}
                  />
                )}
              </div>
              <p className="text-[10px] truncate text-gray-300 font-medium">
                {step.badge}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Step Content Card */}
      <div className="bg-studio-card/90 border border-indigo-500/30 rounded-xl p-4.5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold font-mono">
                {currentTour.badge}
              </span>
              <h3 className="text-sm font-bold text-white">{currentTour.title}</h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed max-w-3xl">
              {currentTour.description}
            </p>
          </div>

          <button
            onClick={() => toggleComplete(currentTour.id)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              completedSteps.includes(currentTour.id)
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-studio-surface border-studio-border text-gray-400 hover:text-white hover:border-gray-400'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>
              {completedSteps.includes(currentTour.id) ? 'Sudah Diuji ✓' : 'Tandai Sudah Diuji'}
            </span>
          </button>
        </div>

        {/* 2-Column Action & Expected Result */}
        <div className="grid grid-cols-12 gap-4 text-xs">
          {/* Action List */}
          <div className="col-span-7 bg-studio-surface/80 border border-studio-border rounded-xl p-3.5 space-y-2">
            <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold">
              <Eye className="w-3.5 h-3.5" />
              <span>Urutan Yang Harus Anda Coba:</span>
            </div>
            <ul className="space-y-1.5 text-gray-300 pl-4 list-decimal marker:text-indigo-400 marker:font-bold">
              {currentTour.actionInstructions.map((inst, idx) => (
                <li key={idx} className="leading-snug">
                  {inst}
                </li>
              ))}
            </ul>
          </div>

          {/* Expected Result & Tip */}
          <div className="col-span-5 space-y-3">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-200">
              <span className="font-semibold text-emerald-300 block mb-1">
                ✓ Hasil yang Diharapkan:
              </span>
              <p className="leading-relaxed text-[11px] text-emerald-100/90">
                {currentTour.expectedResult}
              </p>
            </div>

            <div className="bg-studio-surface/60 border border-studio-border rounded-xl p-2.5 text-[11px] text-gray-400 flex items-start space-x-2">
              <HelpCircle className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-purple-300">Pro-Tip:</strong> {currentTour.proTip}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-studio-border/60">
          <button
            onClick={handlePrev}
            disabled={activeStep === 1}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeStep === 1
                ? 'opacity-40 cursor-not-allowed border-studio-border text-gray-500'
                : 'bg-studio-surface hover:bg-studio-border border-studio-border text-gray-300 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Langkah Sebelumnya</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-indigo-300 font-mono">
              Perhatikan area yang menyala di layar untuk langkah ini!
            </span>
          </div>

          <button
            onClick={handleNext}
            disabled={activeStep === TOUR_STEPS.length}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeStep === TOUR_STEPS.length
                ? 'opacity-40 cursor-not-allowed border-studio-border text-gray-500'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
            }`}
          >
            <span>Langkah Berikutnya</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
