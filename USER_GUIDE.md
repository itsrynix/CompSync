# 📘 Panduan Penggunaan & Prosedur Testing CompSync Desktop

**CompSync** adalah aplikasi desktop version control & sinkronisasi peer-to-peer (P2P) lokal khusus untuk workflow **Adobe After Effects (`.aep`)** dan ekosistem video editing.

---

## 🚀 Prosedur Menjalankan Aplikasi

Aplikasi CompSync berjalan sebagai aplikasi native Windows desktop (`.exe`), bukan web app.

### Lokasi File Executable
File aplikasi berada di:
```text
bin/compsync-v0.1.0-beta.exe
```
*(Atau Anda cukup double-click `Buka_CompSync.bat` di folder utama).*

---

## 🛠️ Langkah Demi Langkah (Step-by-Step SOP)

### 1. Memilih Folder Project After Effects
1. Pada tampilan atas aplikasi, klik tombol **"Pilih Folder Project..."** (dengan ikon folder warna biru/indigo).
2. Jendela dialog native Windows File Explorer akan terbuka.
3. Arahkan dan pilih folder tempat Anda menyimpan file project After Effects (`.aep`) dan footage Anda (misalnya: `D:\Proyek_AE\Promo_2026`).

---

### 2. Inisialisasi Repository CompSync (Pertama Kali)
Jika folder project belum pernah didaftarkan ke CompSync:
1. Layar akan menampilkan kartu **"Folder Belum Diinisialisasi"**.
2. Klik tombol **"Inisialisasi CompSync Sekarang"**.
3. CompSync secara otomatis akan:
   - Membuat direktori rahasia `.compsync/` untuk database versi.
   - Menginisialisasi cache SQLite WAL (`index.db`).
   - Membuat file konfigurasi `.compsyncignore` yang otomatis mengabaikan file sampah seperti *After Effects Disk Cache*, *Auto-Save*, `.adobecache`, dan scratch preview file.

---

### 3. Deteksi Kunci File (`.aep Lock Inspector`)
CompSync memiliki Win32 File Lock Inspector native untuk mencegah file `.aep` korup:
- **Badge Merah (`TERKUNCI: After Effects`)**:
  Menandakan project `.aep` sedang dibuka dan aktif di aplikasi Adobe After Effects. Jangan mengganti file saat status ini aktif.
- **Badge Hijau (`AMAN / Unlocked`)**:
  Menandakan project After Effects sudah disimpan dan ditutup. File berada dalam kondisi aman 100% untuk disinkronkan ke workstation lain.

---

### 4. Memindai File & Hash Super Cepat (Scan Workspace)
1. Di panel kiri bawah **"Scan Workspace"**, klik **"Run Incremental Scan"**.
2. CompSync akan memindai seluruh aset (footage video 4K/ProRes, audio WAV, gambar PNG, dan file `.aep`).
3. Menggunakan **SIMD BLAKE3 Tree Hashing**:
   - Kecepatan pemrosesan mencapai **3+ GB/s** menggunakan Rayon multi-threading dan Memory-Mapped Files (mmap).
   - File yang tidak berubah langsung dibaca dari cache database SQLite (instant scan).
4. Hasil scan akan menampilkan daftar file yang **Added**, **Modified**, atau **Cached**, lengkap dengan throughput kecepatan (GB/s).

---

### 5. Membuat Snapshot Versi (Git-Style Commit)
1. Di panel kanan **"Project Timeline"**, tulis deskripsi revisi di kolom teks catatan (misal: *"Selesai revisi lower third dan grading footage Cam B"*).
2. Klik tombol **"Commit Snapshot"**.
3. CompSync akan membuat snapshot kriptografis lengkap berformat JSON di `.compsync/objects/snapshots/`, mencatat hash setiap file, ukuran, dan timestamp.
4. Riwayat snapshot akan muncul di daftar linimasa (timeline) dengan identitas komputer pembuatnya.

---

### 6. Sinkronisasi Antar Laptop & PC Desktop (LAN P2P)
1. Jalankan CompSync di PC dan Laptop Anda yang berada di jaringan WiFi/LAN yang sama.
2. Fitur **Zero-Config UDP Beacon** (port `52425`) otomatis mendeteksi workstation lain dalam hitungan detik di widget **"Workstations on LAN"**.
3. Jika workstation lain memiliki revisi terbaru:
   - Klik tombol **"Sync & Pull"** pada kartu workstation tersebut.
   - Transfer berlangsung peer-to-peer melalui protokol TCP port `52424` dengan chunking 64MB dan verifikasi hash otomatis.
   - Tidak memerlukan koneksi internet ataupun cloud!
