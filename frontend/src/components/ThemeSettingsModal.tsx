import React, { useState } from "react";
import { X, Check, Palette, Globe } from "lucide-react";
import { Language, I18N } from "../i18n";

export interface ThemePreset {
  id: string;
  name: string;
  colors: {
    bg: string;
    surface: string;
    sidebar: string;
    card: string;
    border: string;
    borderSubtle: string;
  };
}

export interface AccentPreset {
  id: string;
  name: string;
  hex: string;
  hoverHex: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "ae-dark",
    name: "After Effects",
    colors: {
      bg: "#1c1d21",
      surface: "#23252a",
      sidebar: "#1f2025",
      card: "#2a2d34",
      border: "rgba(255, 255, 255, 0.07)",
      borderSubtle: "rgba(255, 255, 255, 0.035)",
    },
  },
  {
    id: "github-slate",
    name: "GitHub Slate",
    colors: {
      bg: "#0d1117",
      surface: "#161b22",
      sidebar: "#12161c",
      card: "#1f242c",
      border: "rgba(255, 255, 255, 0.075)",
      borderSubtle: "rgba(255, 255, 255, 0.035)",
    },
  },
  {
    id: "ae-darkest",
    name: "Deep Studio",
    colors: {
      bg: "#141518",
      surface: "#1b1c20",
      sidebar: "#17181c",
      card: "#222429",
      border: "rgba(255, 255, 255, 0.065)",
      borderSubtle: "rgba(255, 255, 255, 0.03)",
    },
  },
  {
    id: "ae-classic",
    name: "AE Classic Gray",
    colors: {
      bg: "#262626",
      surface: "#2f2f2f",
      sidebar: "#2a2a2a",
      card: "#383838",
      border: "rgba(255, 255, 255, 0.085)",
      borderSubtle: "rgba(255, 255, 255, 0.04)",
    },
  },
  {
    id: "premiere-slate",
    name: "Premiere Indigo",
    colors: {
      bg: "#181920",
      surface: "#20222b",
      sidebar: "#1b1d25",
      card: "#272a36",
      border: "rgba(255, 255, 255, 0.075)",
      borderSubtle: "rgba(255, 255, 255, 0.035)",
    },
  },
  {
    id: "davinci-warm",
    name: "Warm Graphite",
    colors: {
      bg: "#1e1d1b",
      surface: "#272523",
      sidebar: "#22201e",
      card: "#302d2a",
      border: "rgba(255, 255, 255, 0.075)",
      borderSubtle: "rgba(255, 255, 255, 0.035)",
    },
  },
];

export const ACCENT_PRESETS: AccentPreset[] = [
  {
    id: "adobe-blue",
    name: "Blue",
    hex: "#1473e6",
    hoverHex: "#2680eb",
  },
  {
    id: "ae-cyan",
    name: "Cyan",
    hex: "#0095ff",
    hoverHex: "#33aaff",
  },
  {
    id: "premiere-purple",
    name: "Purple",
    hex: "#7c69ef",
    hoverHex: "#9180f5",
  },
  {
    id: "emerald-sync",
    name: "Green",
    hex: "#10b981",
    hoverHex: "#34d399",
  },
  {
    id: "amber-cinema",
    name: "Amber",
    hex: "#d97706",
    hoverHex: "#f59e0b",
  },
];

export function applyThemeToDom(themeId: string, accentId: string) {
  const normalizedId = themeId === "ae-default" ? "ae-dark" : themeId;
  const theme =
    THEME_PRESETS.find((t) => t.id === normalizedId) || THEME_PRESETS[0];
  const accent =
    ACCENT_PRESETS.find((a) => a.id === accentId) || ACCENT_PRESETS[0];

  const root = document.documentElement;
  root.style.setProperty("--studio-bg", theme.colors.bg);
  root.style.setProperty("--studio-surface", theme.colors.surface);
  root.style.setProperty("--studio-sidebar", theme.colors.sidebar);
  root.style.setProperty("--studio-card", theme.colors.card);
  root.style.setProperty("--studio-border", theme.colors.border);
  root.style.setProperty("--studio-border-subtle", theme.colors.borderSubtle);
  root.style.setProperty("--studio-blue", accent.hex);
  root.style.setProperty("--studio-blue-hover", accent.hoverHex);
}

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeThemeId?: string;
  selectedThemeId?: string;
  activeAccentId?: string;
  selectedAccentId?: string;
  onSelectTheme: (themeId: string) => void;
  onSelectAccent: (accentId: string) => void;
  language?: Language;
  onSelectLanguage?: (lang: Language) => void;
  deviceName?: string;
  onRenameDevice?: (name: string) => void;
}

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  onClose,
  activeThemeId,
  selectedThemeId,
  activeAccentId,
  selectedAccentId,
  onSelectTheme,
  onSelectAccent,
  language = "en",
  onSelectLanguage,
  deviceName = "",
  onRenameDevice,
}) => {
  const [activeTab, setActiveTab] = useState<"appearance" | "general">("appearance");

  if (!isOpen) return null;

  const t = I18N[language];
  const rawThemeId = activeThemeId || selectedThemeId || "ae-dark";
  const currentThemeId = rawThemeId === "ae-default" ? "ae-dark" : rawThemeId;
  const currentAccentId = activeAccentId || selectedAccentId || "adobe-blue";

  const currentAccent =
    ACCENT_PRESETS.find((a) => a.id === currentAccentId) || ACCENT_PRESETS[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[780px] bg-studio-surface border border-studio-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-studio-border bg-studio-sidebar">
          <span className="text-[15px] font-semibold text-gray-100 tracking-tight">
            {t.settingsTitle}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Layout: Left Sidebar + Right Content */}
        <div className="flex min-h-[480px]">
          {/* Left Category Sidebar */}
          <div className="w-[195px] shrink-0 border-r border-studio-border bg-studio-sidebar/60 p-3.5 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("appearance")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                activeTab === "appearance"
                  ? "bg-white/[0.09] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
              }`}
            >
              <Palette
                className="w-4 h-4 shrink-0"
                style={{ color: currentAccent.hex }}
              />
              <span>{t.tabAppearance}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                activeTab === "general"
                  ? "bg-white/[0.09] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
              }`}
            >
              <Globe className="w-4 h-4 shrink-0 text-studio-blue-light" />
              <span>{t.tabGeneral}</span>
            </button>
          </div>

          {/* Right Content Panel */}
          <div className="flex-1 p-7 space-y-6 bg-studio-surface">
            {activeTab === "appearance" && (
              <>
                {/* Theme Cards Grid */}
                <div>
                  <div className="text-[13px] font-medium text-gray-300 mb-3.5">
                    {t.colorTheme}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {THEME_PRESETS.map((preset) => {
                      const isSelected = preset.id === currentThemeId;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => onSelectTheme(preset.id)}
                          className={`group text-left rounded-xl p-3 transition-all border ${
                            isSelected
                              ? "bg-studio-card/90 shadow-lg"
                              : "border-studio-border bg-studio-bg/50 hover:bg-studio-card/50 hover:border-white/15"
                          }`}
                          style={{
                            borderColor: isSelected
                              ? currentAccent.hex
                              : undefined,
                            boxShadow: isSelected
                              ? `0 0 0 1px ${currentAccent.hex}`
                              : undefined,
                          }}
                        >
                          {/* Visual Miniature UI Preview */}
                          <div
                            className="w-full h-24 rounded-lg overflow-hidden border flex flex-col relative mb-2.5"
                            style={{
                              backgroundColor: preset.colors.bg,
                              borderColor: "rgba(255,255,255,0.08)",
                            }}
                          >
                            {/* Mini Top Bar */}
                            <div
                              className="h-4 w-full flex items-center justify-between px-2.5 border-b"
                              style={{
                                backgroundColor: preset.colors.sidebar,
                                borderColor: "rgba(255,255,255,0.06)",
                              }}
                            >
                              <div className="w-6 h-1.5 rounded-full bg-white/25" />
                              <div
                                className="w-5 h-1.5 rounded-full"
                                style={{ backgroundColor: currentAccent.hex }}
                              />
                            </div>

                            {/* Mini Main Area */}
                            <div className="flex-1 flex">
                              <div
                                className="w-5/12 h-full p-2 space-y-1.5 border-r"
                                style={{
                                  backgroundColor: preset.colors.surface,
                                  borderColor: "rgba(255,255,255,0.06)",
                                }}
                              >
                                <div
                                  className="h-2 w-full rounded-sm"
                                  style={{
                                    backgroundColor: currentAccent.hex,
                                    opacity: 0.45,
                                  }}
                                />
                                <div className="h-2 w-4/5 rounded-sm bg-white/10" />
                                <div className="h-2 w-3/5 rounded-sm bg-white/10" />
                              </div>

                              <div className="flex-1 p-2 flex flex-col justify-between">
                                <div
                                  className="h-6 w-full rounded border px-1.5 flex items-center"
                                  style={{
                                    backgroundColor: preset.colors.card,
                                    borderColor: "rgba(255,255,255,0.05)",
                                  }}
                                >
                                  <div className="w-1/2 h-1.5 rounded-full bg-white/15" />
                                </div>
                                <div className="flex items-center justify-between gap-1.5">
                                  <div className="h-2.5 w-10 rounded-sm bg-white/15" />
                                  <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: currentAccent.hex }}
                                  />
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <div
                                className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-md"
                                style={{ backgroundColor: currentAccent.hex }}
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <div className="text-[13px] font-medium text-gray-200 truncate text-center">
                            {preset.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accent Swatches */}
                <div className="pt-5 border-t border-studio-border flex items-center justify-between">
                  <span className="text-[13px] font-medium text-gray-300">
                    {t.accentColor}
                  </span>
                  <div className="flex items-center gap-3">
                    {ACCENT_PRESETS.map((accent) => {
                      const isSelected = accent.id === currentAccentId;
                      return (
                        <button
                          key={accent.id}
                          type="button"
                          onClick={() => onSelectAccent(accent.id)}
                          title={accent.name}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                            isSelected
                              ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-studio-surface"
                              : "opacity-80 hover:opacity-100 hover:scale-105"
                          }`}
                          style={{ backgroundColor: accent.hex }}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <div className="text-[13px] font-medium text-gray-300 mb-2">Device name</div>
                  <p className="text-xs text-studio-text-muted mb-3">This name is shown to paired computers on the LAN.</p>
                  <input
                    value={deviceName}
                    onChange={(event) => onRenameDevice?.(event.target.value)}
                    className="w-full max-w-sm rounded-lg border border-studio-border bg-studio-bg px-3 py-2 text-xs text-studio-text-primary outline-none focus:border-studio-blue"
                    placeholder="e.g. Studio Desktop"
                  />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-gray-300 mb-2">
                    {t.languageLabel}
                  </div>
                  <p className="text-xs text-studio-text-muted mb-4">
                    Choose the primary language for CompSync interface.
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button
                      type="button"
                      onClick={() => onSelectLanguage && onSelectLanguage("en")}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        language === "en"
                          ? "bg-studio-card border-studio-blue text-white shadow-sm"
                          : "bg-studio-bg/60 border-studio-border text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">English</div>
                        <div className="text-[10px] text-studio-text-muted">Default</div>
                      </div>
                      {language === "en" && <Check className="w-4 h-4 text-studio-blue-light" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectLanguage && onSelectLanguage("id")}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        language === "id"
                          ? "bg-studio-card border-studio-blue text-white shadow-sm"
                          : "bg-studio-bg/60 border-studio-border text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">Bahasa Indonesia</div>
                        <div className="text-[10px] text-studio-text-muted">ID</div>
                      </div>
                      {language === "id" && <Check className="w-4 h-4 text-studio-blue-light" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
