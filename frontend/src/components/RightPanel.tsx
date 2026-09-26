import React, { useState, useMemo } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import {
  SnapshotSummaryDto,
  RepoStatusDto,
  ScannedFileDto,
  ScanResultDto,
} from "../types";
import {
  Folder,
  Layers,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileVideo,
  Music,
  FileCode,
  FileText,
  Clock,
  FolderOpen,
  Search,
  X,
  Type,
  FileQuestion,
  Filter,
} from "lucide-react";
import { Language, I18N } from "../i18n";

interface Props {
  projectPath: string;
  status: RepoStatusDto | null;
  onOpenFolder: (subPath?: string) => void;
  selectedFile: ScannedFileDto | null;
  selectedSnapshot: SnapshotSummaryDto | null;
  myDeviceName: string;
  scanResult?: ScanResultDto | null;
  onSelectFile?: (file: ScannedFileDto) => void;
  onCloseDetail?: () => void;
  language?: Language;
}

type FileCategory = "all" | "aep" | "video" | "audio" | "images" | "other";

export const RightPanel: React.FC<Props> = ({
  projectPath,
  status,
  onOpenFolder,
  selectedFile,
  selectedSnapshot,
  myDeviceName,
  scanResult,
  onSelectFile,
  onCloseDetail,
  language = "en",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<FileCategory>("all");
  const [customExtensions, setCustomExtensions] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("compsync_custom_extensions") || "[]");
    } catch {
      return [];
    }
  });
  const [newExtension, setNewExtension] = useState("");
  const [isCustomFilterOpen, setIsCustomFilterOpen] = useState(false);
  const t = I18N[language];

  const primaryAep = status?.aep_files?.[0];
  const isAepLocked = primaryAep?.lock?.is_locked;

  const files = scanResult?.files || [];

  const getFileCategory = (path: string): FileCategory => {
    const ext = path.split(".").pop()?.toLowerCase() || "";
    if (ext === "aep") return "aep";
    if (["mov", "mp4", "avi", "mkv", "mxf", "prores"].includes(ext)) return "video";
    if (["wav", "mp3", "aac", "cfa", "m4a", "flac"].includes(ext)) return "audio";
    if (["png", "jpg", "jpeg", "psd", "ai", "exr", "tiff", "svg"].includes(ext)) return "images";
    return "other";
  };

  const getFileIcon = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase() || "";
    if (ext === "aep") return <Layers className="w-4 h-4 text-purple-400" />;
    if (["mov", "mp4", "avi", "mkv", "mxf", "prores"].includes(ext))
      return <FileVideo className="w-4 h-4 text-studio-blue-light" />;
    if (["wav", "mp3", "aac", "cfa", "m4a", "flac"].includes(ext))
      return <Music className="w-4 h-4 text-emerald-400" />;
    if (["png", "jpg", "jpeg", "psd", "ai", "exr", "tiff"].includes(ext))
      return <FileText className="w-4 h-4 text-amber-400" />;
    if (["otf", "ttf", "woff", "woff2"].includes(ext))
      return <Type className="w-4 h-4 text-rose-400" />;
    if (["mogrt", "json", "jsx", "prproj", "xml"].includes(ext))
      return <FileCode className="w-4 h-4 text-cyan-400" />;
    return <FileQuestion className="w-4 h-4 text-gray-400" />;
  };

  // Category counts
  const counts = useMemo(() => {
    const res: Record<FileCategory, number> = {
      all: files.length,
      aep: 0,
      video: 0,
      audio: 0,
      images: 0,
      other: 0,
    };
    files.forEach((f) => {
      const cat = getFileCategory(f.path);
      res[cat] = (res[cat] || 0) + 1;
    });
    return res;
  }, [files]);

  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      // Category filter
      if (activeCategory !== "all") {
        const cat = getFileCategory(f.path);
        if (cat !== activeCategory) return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const pathMatches = f.path.toLowerCase().includes(query);
        const stateMatches = f.state.toLowerCase().includes(query);
        if (!pathMatches && !stateMatches) return false;
      }
      if (customExtensions.length > 0) {
        const extension = `.${f.path.split(".").pop()?.toLowerCase() || ""}`;
        if (!customExtensions.includes(extension)) return false;
      }
      return true;
    });
  }, [files, activeCategory, searchTerm, customExtensions]);

  const addCustomExtension = () => {
    const normalized = newExtension.trim().toLowerCase().replace(/^[^a-z0-9]+/, "");
    if (!normalized) return;
    const extension = `.${normalized}`;
    const next = customExtensions.includes(extension) ? customExtensions : [...customExtensions, extension];
    setCustomExtensions(next);
    localStorage.setItem("compsync_custom_extensions", JSON.stringify(next));
    setNewExtension("");
  };

  const selectedExtension = selectedFile?.path.split(".").pop()?.toLowerCase();
  const selectedAssetUrl = selectedFile?.absolute_path ? convertFileSrc(selectedFile.absolute_path) : "";

  const totalVolumeMb = files.reduce((acc, f) => acc + (f.size_mb || 0), 0);
  const totalVolumeDisplay =
    totalVolumeMb >= 1024
      ? `${(totalVolumeMb / 1024).toFixed(1)} GB`
      : `${totalVolumeMb.toFixed(0)} MB`;

  const getStatusLabel = (state: string) => {
    if (state === "Tersimpan") return t.statusSynced;
    if (state === "Diubah") return t.statusModified;
    if (state === "Baru") return t.statusNew;
    if (state === "Hilang") return t.statusDeleted;
    if (state === "Missing") return t.statusMissing;
    if (state === "Konflik") return t.statusConflict;
    return state;
  };

  return (
    <div
      data-tour="step-6"
      className="flex flex-col h-full bg-studio-bg overflow-hidden select-none"
    >
      {/* Main Body: Inspector Card (if selected) + Directory Rows List with Filter Buttons */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* File Inspector Card */}
        {selectedFile && (
          <div className="bg-studio-surface border border-studio-border rounded-xl p-4 space-y-3 shadow-md animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-studio-card border border-studio-border">
                  {getFileIcon(selectedFile.path)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-studio-text-primary">
                    {selectedFile.path.split("/").pop()}
                  </h3>
                  <p className="text-xs text-studio-text-muted font-mono mt-0.5">
                    {selectedFile.path}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded font-medium border ${
                    selectedFile.state === "Baru"
                      ? "bg-studio-green-subtle text-studio-green-text border-studio-green-border"
                      : selectedFile.state === "Diubah"
                      ? "bg-studio-blue-subtle text-studio-blue-light border-studio-blue-border"
                      : selectedFile.state === "Hilang"
                      ? "bg-studio-red-bg text-studio-red-text border-studio-red-border"
                      : "bg-studio-card text-studio-text-secondary border-studio-border"
                  }`}
                >
                  {getStatusLabel(selectedFile.state)}
                </span>

                {onCloseDetail && (
                  <button
                    onClick={onCloseDetail}
                    className="p-1 text-studio-text-muted hover:text-studio-text-primary rounded hover:bg-studio-card transition-colors"
                    title={t.closeDetail}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* File Specs Grid */}
            {selectedFile && selectedAssetUrl && selectedFile.state !== "Hilang" && (
              <div className="overflow-hidden rounded-lg border border-studio-border bg-black/20">
                {selectedExtension && ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(selectedExtension) ? (
                  <img src={selectedAssetUrl} alt={selectedFile.path} className="max-h-64 w-full object-contain" />
                ) : selectedExtension && ["mp3", "wav", "m4a", "flac", "aac", "ogg"].includes(selectedExtension) ? (
                  <div className="p-4"><audio controls src={selectedAssetUrl} className="w-full" /></div>
                ) : null}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 pt-2 text-xs border-t border-studio-borderSubtle">
              <div>
                <span className="text-[10px] uppercase font-bold text-studio-text-muted block">
                  {t.fileSize}
                </span>
                <span className="font-mono text-studio-text-primary text-xs mt-0.5 block font-semibold">
                  {selectedFile.size_mb >= 1024
                    ? `${(selectedFile.size_mb / 1024).toFixed(2)} GB`
                    : `${selectedFile.size_mb.toFixed(1)} MB`}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-studio-text-muted block">
                  {t.shortChecksum}
                </span>
                <span className="font-mono text-studio-text-secondary text-xs mt-0.5 block">
                  {selectedFile.hash_short || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-studio-text-muted block">
                  {t.syncStatus}
                </span>
                <span className="text-studio-text-primary text-xs mt-0.5 block">
                  {selectedFile.state === "Tersimpan" ? t.synced : t.needsSave}
                </span>
              </div>
            </div>

            {/* Specific info for AEP file */}
            {selectedFile.path.endsWith(".aep") && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                  isAepLocked
                    ? "bg-studio-red-subtle border-studio-red-border text-studio-red-text"
                    : "bg-studio-green-subtle border-studio-green-border text-studio-green-text"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {isAepLocked ? (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>
                    {isAepLocked
                      ? t.aeFileLockedMsg(primaryAep?.lock?.process_name || "AfterFX.exe")
                      : t.aeFileSafeMsg}
                  </span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-1 flex items-center space-x-2">
              <button
                onClick={() => onOpenFolder(selectedFile.absolute_path || selectedFile.path)}
                className="px-3 py-1.5 rounded-lg bg-studio-card hover:bg-studio-cardHover border border-studio-border text-xs text-studio-text-primary transition-colors flex items-center space-x-1.5"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>{t.openLocation}</span>
                <ExternalLink className="w-3 h-3 text-studio-text-muted" />
              </button>
            </div>
          </div>
        )}

        {/* Snapshot Detail View */}
        {selectedSnapshot && !selectedFile && (
          <div className="bg-studio-surface border border-studio-border rounded-xl p-4 space-y-3 shadow-md animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-studio-blue-light uppercase tracking-wider">
                  Snapshot ID: {selectedSnapshot.snapshot_id}
                </span>
                <h3 className="text-sm font-semibold text-studio-text-primary mt-0.5">
                  {selectedSnapshot.message}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-xs text-studio-text-muted bg-studio-sidebar px-2 py-0.5 rounded border border-studio-border">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(selectedSnapshot.created_at).toLocaleTimeString()}
                  </span>
                </div>
                {onCloseDetail && (
                  <button
                    onClick={onCloseDetail}
                    className="p-1 text-studio-text-muted hover:text-studio-text-primary rounded hover:bg-studio-card transition-colors"
                    title={t.closeDetail}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-studio-borderSubtle">
              <div>
                <span className="text-[10px] uppercase font-bold text-studio-text-muted block">
                  Author / Device
                </span>
                <span className="text-studio-text-primary font-medium mt-0.5 block">
                  {selectedSnapshot.author_name}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-studio-text-muted block">
                  Locked Assets
                </span>
                <span className="text-studio-text-primary font-medium mt-0.5 block">
                  {selectedSnapshot.total_files} files (
                  {(selectedSnapshot.total_mb / 1024).toFixed(1)} GB)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Directory File Section with Filter Chips & Search Bar */}
        <div className="bg-studio-surface border border-studio-border rounded-xl overflow-hidden shadow-sm">
          {/* Header Row: Title & Search */}
          <div className="px-4 py-3 border-b border-studio-border bg-studio-sidebar/70 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2 min-w-0">
              <Folder className="w-4 h-4 text-studio-blue-light flex-shrink-0" />
              <span className="text-xs font-semibold text-studio-text-primary">
                {t.projectFiles}
              </span>
              <span className="text-[11px] text-studio-text-muted">
                ({files.length} • {totalVolumeDisplay})
              </span>
            </div>

            {/* Quick Search Input */}
            <div className="relative w-48">
              <Search className="w-3 h-3 text-studio-text-muted absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchFiles}
                className="w-full bg-studio-card border border-studio-border rounded-lg pl-7 pr-2.5 py-1 text-xs text-studio-text-primary placeholder:text-studio-text-muted focus:outline-none focus:border-studio-blue"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-2 text-studio-text-muted hover:text-studio-text-primary"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Chips Bar (All, AEP, Video, Audio, Images, Other) */}
          <div className="px-3.5 py-2 border-b border-studio-border/60 bg-studio-sidebar/40 flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                activeCategory === "all"
                  ? "bg-studio-blue text-white shadow-sm"
                  : "bg-studio-card/80 text-studio-text-secondary hover:text-studio-text-primary border border-studio-border/60"
              }`}
            >
              <span>{t.filterAll}</span>
              <span className={`text-[10px] ${activeCategory === "all" ? "text-white/80" : "text-studio-text-muted"}`}>
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory("aep")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                activeCategory === "aep"
                  ? "bg-studio-blue text-white shadow-sm"
                  : "bg-studio-card/80 text-studio-text-secondary hover:text-studio-text-primary border border-studio-border/60"
              }`}
            >
              <Layers className="w-3 h-3 text-purple-400" />
              <span>{t.filterAep}</span>
              <span className={`text-[10px] ${activeCategory === "aep" ? "text-white/80" : "text-studio-text-muted"}`}>
                {counts.aep}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory("video")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                activeCategory === "video"
                  ? "bg-studio-blue text-white shadow-sm"
                  : "bg-studio-card/80 text-studio-text-secondary hover:text-studio-text-primary border border-studio-border/60"
              }`}
            >
              <FileVideo className="w-3 h-3 text-studio-blue-light" />
              <span>{t.filterVideo}</span>
              <span className={`text-[10px] ${activeCategory === "video" ? "text-white/80" : "text-studio-text-muted"}`}>
                {counts.video}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory("audio")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                activeCategory === "audio"
                  ? "bg-studio-blue text-white shadow-sm"
                  : "bg-studio-card/80 text-studio-text-secondary hover:text-studio-text-primary border border-studio-border/60"
              }`}
            >
              <Music className="w-3 h-3 text-emerald-400" />
              <span>{t.filterAudio}</span>
              <span className={`text-[10px] ${activeCategory === "audio" ? "text-white/80" : "text-studio-text-muted"}`}>
                {counts.audio}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory("images")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                activeCategory === "images"
                  ? "bg-studio-blue text-white shadow-sm"
                  : "bg-studio-card/80 text-studio-text-secondary hover:text-studio-text-primary border border-studio-border/60"
              }`}
            >
              <FileText className="w-3 h-3 text-amber-400" />
              <span>{t.filterImages}</span>
              <span className={`text-[10px] ${activeCategory === "images" ? "text-white/80" : "text-studio-text-muted"}`}>
                {counts.images}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory("other")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                activeCategory === "other"
                  ? "bg-studio-blue text-white shadow-sm"
                  : "bg-studio-card/80 text-studio-text-secondary hover:text-studio-text-primary border border-studio-border/60"
              }`}
            >
              <Type className="w-3 h-3 text-rose-400" />
              <span>{t.filterOther}</span>
              <span className={`text-[10px] ${activeCategory === "other" ? "text-white/80" : "text-studio-text-muted"}`}>
                {counts.other}
              </span>
            </button>

            <div className="relative ml-auto">
              <button
                onClick={() => setIsCustomFilterOpen((open) => !open)}
                className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${customExtensions.length > 0 ? "border-studio-blue bg-studio-blue/15 text-studio-blue-light" : "border-studio-border/60 bg-studio-card/80 text-studio-text-secondary hover:text-studio-text-primary"}`}
              >
                Custom{customExtensions.length > 0 ? ` (${customExtensions.length})` : ""}
              </button>
              {isCustomFilterOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-studio-border bg-studio-surface p-2 shadow-xl">
                  <div className="flex gap-1.5">
                    <input
                      value={newExtension}
                      onChange={(event) => setNewExtension(event.target.value)}
                      onKeyDown={(event) => event.key === "Enter" && addCustomExtension()}
                      placeholder=".obj"
                      className="min-w-0 flex-1 rounded border border-studio-border bg-studio-bg px-2 py-1 text-[11px] text-studio-text-primary outline-none focus:border-studio-blue"
                    />
                    <button onClick={addCustomExtension} className="rounded bg-studio-blue px-2 text-[11px] font-semibold text-white">Add</button>
                  </div>
                  <div className="mt-2 space-y-1">
                    {customExtensions.map((extension) => (
                      <label key={extension} className="flex items-center gap-2 px-1 text-[11px] text-studio-text-secondary">
                        <input
                          type="checkbox"
                          checked
                          onChange={() => {
                            const next = customExtensions.filter((item) => item !== extension);
                            setCustomExtensions(next);
                            localStorage.setItem("compsync_custom_extensions", JSON.stringify(next));
                          }}
                        />
                        {extension}
                      </label>
                    ))}
                    {customExtensions.length === 0 && <p className="px-1 text-[10px] text-studio-text-muted">Add .obj, .e3d, .mogrt...</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Directory Rows */}
          {filteredFiles.length === 0 ? (
            <div className="p-8 text-center text-xs text-studio-text-muted">
              {t.noFilesFound}
            </div>
          ) : (
            <div className="divide-y divide-studio-border/50 text-xs">
              {filteredFiles.map((file) => {
                const isSelected = selectedFile?.path === file.path;
                return (
                  <div
                    key={file.path}
                    onClick={() => onSelectFile && onSelectFile(file)}
                    className={`px-4 py-2.5 flex items-center justify-between transition-colors cursor-pointer group ${
                      isSelected
                        ? "bg-studio-blue/15 border-l-2 border-studio-blue"
                        : "hover:bg-studio-card/60"
                    }`}
                  >
                    {/* Left: Icon + Name + Path */}
                    <div className="flex items-center space-x-3 min-w-0 flex-1 pr-3">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.path)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-studio-text-primary truncate">
                          {file.path.split("/").pop()}
                        </div>
                        <div className="text-[10px] font-mono text-studio-text-muted truncate mt-0.5">
                          {file.path}
                        </div>
                      </div>
                    </div>

                    {/* Right: Size + State Badge + Checksum + Explorer Button */}
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <span className="font-mono text-studio-text-secondary text-[11px] w-18 text-right">
                        {file.size_mb >= 1024
                          ? `${(file.size_mb / 1024).toFixed(1)} GB`
                          : `${file.size_mb.toFixed(1)} MB`}
                      </span>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                          file.state === "Baru"
                            ? "bg-studio-green-subtle text-studio-green-text border-studio-green-border"
                            : file.state === "Diubah"
                            ? "bg-studio-blue-subtle text-studio-blue-light border-studio-blue-border"
                            : file.state === "Hilang"
                            ? "bg-studio-red-bg text-studio-red-text border-studio-red-border"
                            : "bg-studio-card text-studio-text-muted border-studio-border"
                        }`}
                      >
                        {getStatusLabel(file.state)}
                      </span>

                      <span className="font-mono text-[10px] text-studio-text-muted hidden md:inline-block w-16 text-center">
                        {file.hash_short || "—"}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenFolder(file.absolute_path || file.path);
                        }}
                        className="p-1 rounded-md bg-studio-card hover:bg-studio-cardHover border border-studio-border text-studio-text-secondary hover:text-studio-text-primary transition-colors"
                        title={t.openInExplorer}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
