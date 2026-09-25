export type Language = "en" | "id";

export interface Translations {
  // TopBar
  activeProject: string;
  selectProject: string;
  integratedProjects: string;
  addNewProject: string;
  openInExplorer: string;
  device: string;
  pullLatest: string;
  syncing: string;
  syncedTo: string;
  syncReady: string;
  lockedAE: string;
  refresh: string;
  settings: string;
  quickGuide: string;
  searchingPeers: string;

  // LeftPanel
  changes: string;
  history: string;
  scan: string;
  scanning: string;
  allSynced: string;
  noNewChanges: string;
  summaryPlaceholder: string;
  descriptionPlaceholder: string;
  commitToSnapshot: (count: number) => string;
  savingSnapshot: string;
  searchHistory: string;
  noMatchingHistory: string;
  filesCount: (count: number, size: string) => string;

  // RightPanel
  projectFiles: string;
  searchFiles: string;
  noFilesFound: string;
  noFilesInFolder: string;
  filterAll: string;
  filterAep: string;
  filterVideo: string;
  filterAudio: string;
  filterImages: string;
  filterOther: string;
  fileSize: string;
  shortChecksum: string;
  syncStatus: string;
  synced: string;
  needsSave: string;
  openLocation: string;
  closeDetail: string;
  aeFileLockedMsg: (process: string) => string;
  aeFileSafeMsg: string;

  // Status badges
  statusSynced: string;
  statusModified: string;
  statusNew: string;

  // Settings Modal
  settingsTitle: string;
  tabAppearance: string;
  tabGeneral: string;
  colorTheme: string;
  accentColor: string;
  languageLabel: string;
  english: string;
  indonesian: string;

  // Tour
  tourSkip: string;
  tourPrev: string;
  tourNext: string;
  tourFinish: string;
}

export const I18N: Record<Language, Translations> = {
  en: {
    activeProject: "ACTIVE PROJECT",
    selectProject: "Select Project Folder",
    integratedProjects: "Integrated Projects",
    addNewProject: "+ Add New Project Folder...",
    openInExplorer: "Open in File Explorer",
    device: "Device:",
    pullLatest: "Pull Latest",
    syncing: "Syncing...",
    syncedTo: "Synced to",
    syncReady: "Sync Ready",
    lockedAE: "Locked (AE Active)",
    refresh: "Refresh Status",
    settings: "Settings",
    quickGuide: "Quick Guide",
    searchingPeers: "Looking for LAN devices...",

    changes: "Changes",
    history: "History",
    scan: "Scan",
    scanning: "Scanning...",
    allSynced: "All files synced & saved.",
    noNewChanges: "No unsaved changes.",
    summaryPlaceholder: "Revision summary (e.g. Color grade scene 1)...",
    descriptionPlaceholder: "Detailed notes or change description (optional)...",
    commitToSnapshot: (count) =>
      count > 0 ? `Commit ${count} files to Snapshot` : "Commit Snapshot",
    savingSnapshot: "Saving Snapshot...",
    searchHistory: "Search revision history...",
    noMatchingHistory: "No matching revisions found.",
    filesCount: (count, size) => `${count} files (${size})`,

    projectFiles: "Project Files & Assets",
    searchFiles: "Search files...",
    noFilesFound: "No files match your search or filter.",
    noFilesInFolder: "No files detected in this project folder.",
    filterAll: "All",
    filterAep: "AEP",
    filterVideo: "Video",
    filterAudio: "Audio",
    filterImages: "Images",
    filterOther: "Other",
    fileSize: "File Size",
    shortChecksum: "Checksum",
    syncStatus: "Sync Status",
    synced: "In Snapshot",
    needsSave: "Unsaved Changes",
    openLocation: "Open File in Explorer",
    closeDetail: "Close",
    aeFileLockedMsg: (p) =>
      `File is currently open in After Effects (${p}). Save changes (Ctrl+S) in AE.`,
    aeFileSafeMsg:
      "File is unlocked. Ready to commit snapshot or sync to peer.",

    statusSynced: "Synced",
    statusModified: "Modified",
    statusNew: "New",

    settingsTitle: "Settings",
    tabAppearance: "Appearance",
    tabGeneral: "General",
    colorTheme: "Color Theme",
    accentColor: "Accent Color",
    languageLabel: "Language",
    english: "English",
    indonesian: "Bahasa Indonesia",

    tourSkip: "Skip",
    tourPrev: "Back",
    tourNext: "Next",
    tourFinish: "Finish",
  },
  id: {
    activeProject: "PROJECT AKTIF",
    selectProject: "Pilih Folder Project",
    integratedProjects: "Daftar Project Terintegrasi",
    addNewProject: "+ Tambah Folder Project Baru...",
    openInExplorer: "Buka di File Explorer",
    device: "Perangkat:",
    pullLatest: "Tarik Versi (Pull)",
    syncing: "Menyalin...",
    syncedTo: "Tersinkron ke",
    syncReady: "Aman Disinkronkan",
    lockedAE: "Terkunci (AE Aktif)",
    refresh: "Muat Ulang Status",
    settings: "Pengaturan",
    quickGuide: "Panduan Singkat",
    searchingPeers: "Mencari perangkat LAN...",

    changes: "Perubahan File",
    history: "Riwayat Versi",
    scan: "Pindai",
    scanning: "Memindai...",
    allSynced: "Semua file sinkron & tersimpan.",
    noNewChanges: "Tidak ada perubahan baru.",
    summaryPlaceholder: "Ringkasan revisi (contoh: Koreksi warna scene 1)...",
    descriptionPlaceholder: "Catatan atau rincian tambahan (opsional)...",
    commitToSnapshot: (count) =>
      count > 0 ? `Simpan ${count} file ke Snapshot` : "Simpan Versi ke Snapshot",
    savingSnapshot: "Menyimpan Versi...",
    searchHistory: "Cari riwayat revisi...",
    noMatchingHistory: "Tidak ada riwayat versi yang cocok.",
    filesCount: (count, size) => `${count} file (${size})`,

    projectFiles: "Direktori & Aset Project",
    searchFiles: "Cari file...",
    noFilesFound: "Tidak ada file yang cocok dengan filter atau pencarian.",
    noFilesInFolder: "Belum ada file yang terdeteksi di folder ini.",
    filterAll: "Semua",
    filterAep: "AEP",
    filterVideo: "Video",
    filterAudio: "Audio",
    filterImages: "Gambar",
    filterOther: "Lainnya",
    fileSize: "Ukuran File",
    shortChecksum: "Checksum",
    syncStatus: "Status Sinkron",
    synced: "Sesuai Snapshot",
    needsSave: "Perlu Disimpan",
    openLocation: "Buka Lokasi File di Explorer",
    closeDetail: "Tutup",
    aeFileLockedMsg: (p) =>
      `File sedang terbuka di After Effects (${p}). Harap simpan revisi (Ctrl+S) di AE.`,
    aeFileSafeMsg:
      "File bebas dari lock proses. Siap dibuat snapshot atau dikirim ke rekan.",

    statusSynced: "Tersimpan",
    statusModified: "Diubah",
    statusNew: "Baru",

    settingsTitle: "Pengaturan",
    tabAppearance: "Tampilan",
    tabGeneral: "Umum",
    colorTheme: "Tema Warna",
    accentColor: "Warna Aksen",
    languageLabel: "Bahasa",
    english: "English",
    indonesian: "Bahasa Indonesia",

    tourSkip: "Lewati",
    tourPrev: "Sebelumnya",
    tourNext: "Lanjut",
    tourFinish: "Selesai",
  },
};
