# CompSync 🎬⚡

> **Local-First P2P Version Control & Synchronization Engine for Adobe After Effects (`.aep`) Workflows.**

[![Release](https://img.shields.io/badge/Release-v0.1.0--beta-indigo.svg)](https://github.com/Rynix/CompSync)
[![Rust](https://img.shields.io/badge/Engine-Rust%201.80+-orange.svg)](https://www.rust-lang.org/)
[![Tauri v2](https://img.shields.io/badge/GUI-Tauri%20v2-24C8D8.svg)](https://v2.tauri.app/)
[![BLAKE3](https://img.shields.io/badge/Hasher-SIMD%20BLAKE3%20(3+%20GB%2Fs)-red.svg)](https://github.com/BLAKE3-team/BLAKE3)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%2F11%20(x64)-blue.svg)]()
[![P2P](https://img.shields.io/badge/Networking-Zero--Config%20LAN%20P2P-emerald.svg)]()

---

## 💡 Mengapa CompSync?

Bagi para *motion designer*, *animator*, dan *video editor*, alur kerja transfer antar workstation (misal: PC Rendering Desktop $\leftrightarrow$ Laptop Mobile) sering kali menghadapi masalah besar:
- **Git Biasa**: Sangat lambat dan membengkak saat menangani aset video berukuran puluhan gigabyte (ProRes, 4K Footage, EXR sequence).
- **Cloud Storage (Google Drive / Dropbox / OneDrive)**: Tidak memiliki deteksi lock file After Effects (`.aep`), sering menyebabkan file korup karena disinkronkan saat After Effects masih aktif menyimpan data, serta memakan kuota internet dan upload bandwidth cloud.
- **CompSync Solusinya**: Engine sinkronisasi *local-first* P2P mandiri yang cepat, aman, dan dirancang khusus untuk After Effects.

---

## ✨ Fitur Inti (Core Highlights)

### 1. ⚡ SIMD BLAKE3 Tree Hashing & SQLite WAL Cache
- Memproses aset footage gigabyte dengan kecepatan **3+ GB/s** memanfaatkan *memory-mapped files* (`memmap2`) dan *multi-core parallelism* (`Rayon`).
- Database SQLite lokal berarsitektur WAL (`index.db`) mencatat pasangan `(file_size, mtime, blake3_hash)` sehingga pemindaian ribuan file yang tidak berubah berlangsung instan (0 milidetik).

### 2. 🛡️ Native Win32 File Lock Inspector
- Memanfaatkan **Windows Restart Manager API** & `CreateFileW` probing native untuk mendeteksi apakah file `.aep` sedang dibuka oleh proses `AfterFX.exe`.
- **Indikator Real-Time**:
  - 🔴 **TERKUNCI**: Project sedang dibuka di After Effects (mencegah penimpaan file yang berpotensi korup).
  - 🟢 **AMAN (Unlocked)**: Project sudah disimpan dan ditutup, 100% aman untuk disinkronkan.

### 3. 📡 Zero-Config LAN P2P Discovery
- Menggunakan penyiaran beacon **UDP Broadcast (port 52425)** setiap 3 detik.
- Komputer desktop dan laptop di jaringan Wi-Fi / LAN yang sama akan saling menemukan secara otomatis tanpa perlu konfigurasi IP manual dan tanpa koneksi internet.

### 4. 📦 Resumable 64MB Chunk Streaming (Fault-Tolerant)
- File footage besar dibagi menjadi blok-blok chunk **64 MB**.
- Transfer TCP (port 52424) dicatat ke dalam staging metadata (`.compsync/staging/[hash]/meta.json`).
- Jika koneksi Wi-Fi terputus di tengah jalan, transfer akan **melanjutkan chunk yang belum selesai tanpa mengulang dari nol**.
- File akhir diverifikasi kriptografis utuh sebelum dipindahkan secara atomik ke direktori project.

### 5. 🎯 Interactive Step-by-Step Guided Tour & Visual Spotlight
- Dilengkapi modul panduan interaktif di dalam aplikasi desktop dengan sorotan visual (*glowing highlight rings*) pada setiap komponen saat diuji.
- Menyediakan checklist progres pengujian dari memilih folder, mendeteksi lock, scan, snapshot, hingga transfer LAN.

---

## 🚀 Download & Menjalankan (v0.1.0-beta)

Aplikasi CompSync adalah **aplikasi desktop Windows native mandiri (`.exe`)** berukuran ringan (~10.9 MB, konsumsi RAM hanya ~43 MB).

### Cara Menjalankan:
1. **Unduh Executable**:
   File `.exe` versi rilis mandiri tersedia di:
   ```text
   bin/compsync-v0.1.0-beta.exe
   ```
2. **Atau jalankan file launcher**:
   Cukup double-click file **[`Buka_CompSync.bat`](file:///c:/Users/Rynix/Documents/Adrian/Coding/CompSync/Buka_CompSync.bat)** di folder utama repository.

---

## 🛠️ Struktur Repository

```text
CompSync/
├── bin/
│   └── compsync-v0.1.0-beta.exe     # Standalone Release Executable
├── crates/
│   ├── compsync_core/                # SIMD BLAKE3 Hasher, SQLite DB, Scanner, IgnoreFilter
│   ├── compsync_watcher/             # Win32 CreateFileW & Restart Manager Lock Detector
│   ├── compsync_network/             # UDP Beacon Discovery & TCP Resumable Chunk Engine
│   └── compsync_cli/                 # Terminal Testing CLI
├── frontend/                         # Creative Studio Dark UI (React 18 + TailwindCSS)
│   └── src/
│       ├── components/
│       │   ├── Header.tsx            # Header, Folder Picker, Lock Badge, Tour Toggle
│       │   ├── StepGuideTour.tsx     # 5-Step Interactive Guided Tour & Checklist
│       │   ├── ScanPanel.tsx         # Fast Working Tree Diff (Throughput GB/s)
│       │   ├── Timeline.tsx          # Git-Style Snapshot History
│       │   └── RadarPeers.tsx        # Zero-Config LAN Workstations Radar
│       └── App.tsx                   # Main App State & Spotlight Logic
├── src-tauri/                        # Tauri v2 Windows Native Bridge
│   ├── Cargo.toml
│   ├── tauri.conf.json               # Standalone config (embedded frontendDist)
│   └── src/main.rs                   # Tauri IPC Handlers (rfd folder dialog, status, scan)
├── USER_GUIDE.md                     # Prosedur Pengujian & SOP Lengkap
├── Buka_CompSync.bat                 # Quick Launcher Script
└── Cargo.toml                        # Rust Workspace Configuration
```

---

## 💻 Kompilasi dari Source Code

### Prasyarat:
1. **Rust**: Toolchain `stable-x86_64-pc-windows-gnu` atau `stable-x86_64-pc-windows-msvc`.
2. **MinGW GCC / MSVC C Compiler**.
3. **Node.js 18+** & npm.

### Langkah Build:
```powershell
# 1. Build Frontend React
cd frontend
npm install
npm run build
cd ..

# 2. Build Tauri Desktop Binary (Release Mode)
cargo build --release -p compsync_desktop

# 3. Jalankan Aplikasi
.\target\release\compsync_desktop.exe
```

---

## 📋 Roadmap Pengembangan

- [x] **Milestone 1**: SIMD BLAKE3 Parallel Tree Hasher & SQLite WAL Cache Index.
- [x] **Milestone 2**: Win32 Lock Inspector (`AfterFX.exe` PID & restart manager detection).
- [x] **Milestone 3**: UDP Broadcast Beacon Zero-Config & Resumable 64MB Chunk TCP Streamer.
- [x] **Milestone 4**: Native Windows Desktop UI (Tauri v2 + React) & Interactive Guided Tour.
- [ ] **Phase 2**: Advisory Lock Forking (Safe branching if both computers edit `.aep` concurrently).
- [ ] **Phase 3**: macOS Native Lock Inspector (`lsof` / `proc_pidinfo`) for cross-platform Windows $\leftrightarrow$ macOS handoff.

---

## 📄 Lisensi
CompSync dilisensikan di bawah lisensi **MIT**. Hak Cipta (c) 2026 Adrian / Rynix.
