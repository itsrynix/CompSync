import React from 'react';
import { X, Check, Sliders, Palette, Sparkles, RotateCcw } from 'lucide-react';

export interface ThemePreset {
  id: string;
  name: string;
  subtitle: string;
  badge?: string;
  colors: {
    bg: string;
    surface: string;
    sidebar: string;
    card: string;
    cardHover: string;
    border: string;
    borderSubtle: string;
    borderHover: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    blue: string;
    blueHover: string;
    blueLight: string;
    blueSubtle: string;
    blueBorder: string;
  };
}

export interface AccentPreset {
  id: string;
  name: string;
  blue: string;
  blueHover: string;
  blueLight: string;
  blueSubtle: string;
  blueBorder: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'ae-default',
    name: 'After Effects Dark',
    subtitle: 'Abu-abu netral standar ruang kerja Adobe After Effects CC',
    badge: 'Default AE',
    colors: {
      bg: '#1d1d1d',
      surface: '#262626',
      sidebar: '#1f1f1f',
      card: '#303030',
      cardHover: '#3a3a3a',
      border: '#383838',
      borderSubtle: '#292929',
      borderHover: '#525252',
      textPrimary: '#e8e8e8',
      textSecondary: '#a3a3a3',
      textMuted: '#737373',
      blue: '#1473e6',
      blueHover: '#0d66d0',
      blueLight: '#3b9eff',
      blueSubtle: 'rgba(20, 115, 230, 0.16)',
      blueBorder: 'rgba(59, 158, 255, 0.35)',
    },
  },
  {
    id: 'ae-darkest',
    name: 'After Effects Deep OLED',
    subtitle: 'Gelap pekat (Brightness 0%) untuk ruang editing minim cahaya',
    badge: '0% Brightness',
    colors: {
      bg: '#121212',
      surface: '#1a1a1a',
      sidebar: '#151515',
      card: '#242424',
      cardHover: '#2e2e2e',
      border: '#2d2d2d',
      borderSubtle: '#202020',
      borderHover: '#454545',
      textPrimary: '#e5e5e5',
      textSecondary: '#999999',
      textMuted: '#666666',
      blue: '#1473e6',
      blueHover: '#0d66d0',
      blueLight: '#4ba3ff',
      blueSubtle: 'rgba(20, 115, 230, 0.18)',
      blueBorder: 'rgba(75, 163, 255, 0.35)',
    },
  },
  {
    id: 'ae-classic',
    name: 'After Effects Classic Gray',
    subtitle: 'Abu-abu medium terang ala After Effects CS6 / CC klasik',
    badge: 'Medium Gray',
    colors: {
      bg: '#282828',
      surface: '#323232',
      sidebar: '#2b2b2b',
      card: '#3d3d3d',
      cardHover: '#474747',
      border: '#484848',
      borderSubtle: '#363636',
      borderHover: '#606060',
      textPrimary: '#f0f0f0',
      textSecondary: '#b5b5b5',
      textMuted: '#858585',
      blue: '#2d8ceb',
      blueHover: '#1b7ad9',
      blueLight: '#5eb0ff',
      blueSubtle: 'rgba(45, 140, 235, 0.18)',
      blueBorder: 'rgba(94, 176, 255, 0.38)',
    },
  },
  {
    id: 'ae-lavender',
    name: 'After Effects Comp Indigo',
    subtitle: 'Nuansa charcoal dengan aksen ungu khas identitas After Effects',
    badge: 'AE Purple',
    colors: {
      bg: '#191820',
      surface: '#22212b',
      sidebar: '#1c1b24',
      card: '#2c2a37',
      cardHover: '#363444',
      border: '#383546',
      borderSubtle: '#282633',
      borderHover: '#504c63',
      textPrimary: '#eceaf6',
      textSecondary: '#a39fb8',
      textMuted: '#736f87',
      blue: '#7c6df0',
      blueHover: '#6958e0',
      blueLight: '#9d91f7',
      blueSubtle: 'rgba(124, 109, 240, 0.16)',
      blueBorder: 'rgba(157, 145, 247, 0.35)',
    },
  },
  {
    id: 'github-slate',
    name: 'GitHub Desktop Slate',
    subtitle: 'Biru-abu gelap modern ala aplikasi kontrol versi GitHub Desktop',
    badge: 'Cool Slate',
    colors: {
      bg: '#16191e',
      surface: '#1f242c',
      sidebar: '#1a1e24',
      card: '#242932',
      cardHover: '#2b313c',
      border: '#30363d',
      borderSubtle: '#242930',
      borderHover: '#484f58',
      textPrimary: '#e6edf3',
      textSecondary: '#8b949e',
      textMuted: '#6e7681',
      blue: '#1f6feb',
      blueHover: '#388bfd',
      blueLight: '#58a6ff',
      blueSubtle: 'rgba(31, 111, 235, 0.14)',
      blueBorder: 'rgba(88, 166, 255, 0.3)',
    },
  },
];

export const ACCENT_PRESETS: AccentPreset[] = [
  {
    id: 'adobe-blue',
    name: 'Adobe Blue (Default AE)',
    blue: '#1473e6',
    blueHover: '#0d66d0',
    blueLight: '#3b9eff',
    blueSubtle: 'rgba(20, 115, 230, 0.16)',
    blueBorder: 'rgba(59, 158, 255, 0.35)',
  },
  {
    id: 'keyframe-cyan',
    name: 'Keyframe Cyan',
    blue: '#0284c7',
    blueHover: '#0369a1',
    blueLight: '#38bdf8',
    blueSubtle: 'rgba(2, 132, 199, 0.16)',
    blueBorder: 'rgba(56, 189, 248, 0.35)',
  },
  {
    id: 'ae-indigo',
    name: 'AE Comp Indigo',
    blue: '#7c6df0',
    blueHover: '#6958e0',
    blueLight: '#9d91f7',
    blueSubtle: 'rgba(124, 109, 240, 0.16)',
    blueBorder: 'rgba(157, 145, 247, 0.35)',
  },
  {
    id: 'emerald-sync',
    name: 'Studio Emerald',
    blue: '#059669',
    blueHover: '#047857',
    blueLight: '#34d399',
    blueSubtle: 'rgba(5, 150, 105, 0.16)',
    blueBorder: 'rgba(52, 211, 153, 0.35)',
  },
  {
    id: 'render-amber',
    name: 'Render Queue Orange',
    blue: '#d97706',
    blueHover: '#b45309',
    blueLight: '#fbbf24',
    blueSubtle: 'rgba(217, 119, 6, 0.16)',
    blueBorder: 'rgba(251, 191, 36, 0.35)',
  },
];

export function applyThemeToDom(themeId: string, accentId?: string) {
  const preset = THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0];
  const accent = ACCENT_PRESETS.find((a) => a.id === accentId);

  const root = document.documentElement;
  root.style.setProperty('--studio-bg', preset.colors.bg);
  root.style.setProperty('--studio-surface', preset.colors.surface);
  root.style.setProperty('--studio-sidebar', preset.colors.sidebar);
  root.style.setProperty('--studio-card', preset.colors.card);
  root.style.setProperty('--studio-card-hover', preset.colors.cardHover);
  root.style.setProperty('--studio-border', preset.colors.border);
  root.style.setProperty('--studio-border-subtle', preset.colors.borderSubtle);
  root.style.setProperty('--studio-border-hover', preset.colors.borderHover);
  root.style.setProperty('--studio-text-primary', preset.colors.textPrimary);
  root.style.setProperty('--studio-text-secondary', preset.colors.textSecondary);
  root.style.setProperty('--studio-text-muted', preset.colors.textMuted);

  const activeBlue = accent ? accent.blue : preset.colors.blue;
  const activeBlueHover = accent ? accent.blueHover : preset.colors.blueHover;
  const activeBlueLight = accent ? accent.blueLight : preset.colors.blueLight;
  const activeBlueSubtle = accent ? accent.blueSubtle : preset.colors.blueSubtle;
  const activeBlueBorder = accent ? accent.blueBorder : preset.colors.blueBorder;

  root.style.setProperty('--studio-blue', activeBlue);
  root.style.setProperty('--studio-blue-hover', activeBlueHover);
  root.style.setProperty('--studio-blue-light', activeBlueLight);
  root.style.setProperty('--studio-blue-subtle', activeBlueSubtle);
  root.style.setProperty('--studio-blue-border', activeBlueBorder);
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedThemeId: string;
  selectedAccentId: string;
  onSelectTheme: (themeId: string) => void;
  onSelectAccent: (accentId: string) => void;
}

export const ThemeSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedThemeId,
  selectedAccentId,
  onSelectTheme,
  onSelectAccent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-[2px] p-4 select-none">
      <div className="bg-studio-surface border border-studio-border rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header (After Effects Preferences Style) */}
        <div className="px-5 py-3.5 border-b border-studio-border flex items-center justify-between bg-studio-sidebar">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-4 h-4 text-studio-blue-light" />
            <div>
              <h2 className="text-sm font-bold text-studio-text-primary">
                Pengaturan Tampilan & Tema (Appearance)
              </h2>
              <p className="text-[11px] text-studio-text-muted">
                Sesuaikan warna ruang kerja CompSync seperti preferensi tema Adobe After Effects Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-studio-card text-studio-text-secondary hover:text-studio-text-primary transition-colors"
            title="Tutup pengaturan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Section 1: Visual Theme Cards (Gambar Preview Warna Tema) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-studio-text-secondary flex items-center space-x-1.5">
                <Palette className="w-3.5 h-3.5 text-studio-blue-light" />
                <span>Pilih Tema Ruang Kerja (Preview Warna UI)</span>
              </label>
              <button
                onClick={() => {
                  onSelectTheme('ae-default');
                  onSelectAccent('adobe-blue');
                }}
                className="flex items-center space-x-1 text-[11px] text-studio-text-muted hover:text-studio-text-primary transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset ke Default AE</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {THEME_PRESETS.map((theme) => {
                const isSelected = selectedThemeId === theme.id;
                const activeAccent =
                  ACCENT_PRESETS.find((a) => a.id === selectedAccentId)?.blue ||
                  theme.colors.blue;

                return (
                  <button
                    key={theme.id}
                    onClick={() => onSelectTheme(theme.id)}
                    className={`group text-left rounded-xl border p-2.5 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-studio-blue bg-studio-card/90 ring-1 ring-studio-blue'
                        : 'border-studio-border bg-studio-sidebar/60 hover:bg-studio-card/50 hover:border-studio-borderHover'
                    }`}
                  >
                    {/* Visual Mockup / Gambar Preview Tema */}
                    <div
                      className="w-full h-28 rounded-lg overflow-hidden border mb-2.5 flex flex-col shadow-inner relative"
                      style={{
                        backgroundColor: theme.colors.bg,
                        borderColor: theme.colors.border,
                      }}
                    >
                      {/* Mockup Top Header Bar */}
                      <div
                        className="h-5 px-2 flex items-center justify-between border-b"
                        style={{
                          backgroundColor: theme.colors.surface,
                          borderColor: theme.colors.border,
                        }}
                      >
                        <div className="flex items-center space-x-1">
                          <span
                            className="w-2 h-2 rounded-sm"
                            style={{ backgroundColor: activeAccent }}
                          />
                          <span
                            className="w-10 h-1.5 rounded-sm"
                            style={{ backgroundColor: theme.colors.textPrimary }}
                          />
                        </div>
                        <div className="flex items-center space-x-1">
                          <span
                            className="w-8 h-2.5 rounded-sm"
                            style={{ backgroundColor: activeAccent }}
                          />
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </div>
                      </div>

                      {/* Mockup 2-Column Workspace (Left Sidebar + Right Comp/Timeline) */}
                      <div className="flex-1 grid grid-cols-12 overflow-hidden">
                        {/* Left Sidebar Mockup */}
                        <div
                          className="col-span-5 p-1.5 space-y-1 border-r flex flex-col justify-between"
                          style={{
                            backgroundColor: theme.colors.sidebar,
                            borderColor: theme.colors.border,
                          }}
                        >
                          <div className="space-y-1">
                            {/* Active file row */}
                            <div
                              className="h-3 rounded-sm px-1 flex items-center justify-between"
                              style={{
                                backgroundColor: theme.colors.card,
                                borderLeft: `2px solid ${activeAccent}`,
                              }}
                            >
                              <span
                                className="w-8 h-1 rounded-sm"
                                style={{ backgroundColor: theme.colors.textPrimary }}
                              />
                              <span
                                className="w-2.5 h-1 rounded-sm"
                                style={{ backgroundColor: activeAccent }}
                              />
                            </div>
                            {/* Secondary file rows */}
                            <div
                              className="h-2.5 rounded-sm px-1 flex items-center justify-between opacity-75"
                              style={{ backgroundColor: theme.colors.surface }}
                            >
                              <span
                                className="w-7 h-1 rounded-sm"
                                style={{ backgroundColor: theme.colors.textSecondary }}
                              />
                            </div>
                            <div
                              className="h-2.5 rounded-sm px-1 flex items-center justify-between opacity-50"
                              style={{ backgroundColor: theme.colors.surface }}
                            >
                              <span
                                className="w-6 h-1 rounded-sm"
                                style={{ backgroundColor: theme.colors.textMuted }}
                              />
                            </div>
                          </div>

                          {/* Bottom Snapshot Commit Button Mockup */}
                          <div
                            className="h-3 rounded-sm flex items-center justify-center"
                            style={{ backgroundColor: activeAccent }}
                          >
                            <span className="w-8 h-1 rounded-sm bg-white/90" />
                          </div>
                        </div>

                        {/* Right Inspector & Asset Row Mockup */}
                        <div className="col-span-7 flex flex-col">
                          {/* Asset Row Chips Mockup */}
                          <div
                            className="h-4 px-1.5 flex items-center space-x-1 border-b"
                            style={{
                              backgroundColor: theme.colors.sidebar,
                              borderColor: theme.colors.borderSubtle,
                            }}
                          >
                            <span
                              className="w-5 h-2 rounded-sm"
                              style={{ backgroundColor: theme.colors.card }}
                            />
                            <span
                              className="w-5 h-2 rounded-sm"
                              style={{ backgroundColor: theme.colors.card }}
                            />
                            <span
                              className="w-5 h-2 rounded-sm"
                              style={{ backgroundColor: theme.colors.card }}
                            />
                          </div>

                          {/* Main Inspector Card Mockup with Keyframes */}
                          <div className="p-1.5 flex-1 flex flex-col justify-between">
                            <div
                              className="p-1.5 rounded border space-y-1"
                              style={{
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.border,
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className="w-10 h-1.5 rounded-sm"
                                  style={{ backgroundColor: theme.colors.textPrimary }}
                                />
                                {/* AE Keyframe Diamond Icon */}
                                <span
                                  className="w-2 h-2 rotate-45 inline-block"
                                  style={{ backgroundColor: activeAccent }}
                                />
                              </div>
                              <div
                                className="w-14 h-1 rounded-sm"
                                style={{ backgroundColor: theme.colors.textSecondary }}
                              />
                            </div>

                            {/* Color Palette Swatch Strip inside Preview */}
                            <div className="flex items-center space-x-1 pt-1">
                              <span
                                className="w-3 h-2 rounded-sm border border-white/10"
                                style={{ backgroundColor: theme.colors.bg }}
                                title={`BG: ${theme.colors.bg}`}
                              />
                              <span
                                className="w-3 h-2 rounded-sm border border-white/10"
                                style={{ backgroundColor: theme.colors.surface }}
                                title={`Surface: ${theme.colors.surface}`}
                              />
                              <span
                                className="w-3 h-2 rounded-sm border border-white/10"
                                style={{ backgroundColor: theme.colors.card }}
                                title={`Card: ${theme.colors.card}`}
                              />
                              <span
                                className="w-3 h-2 rounded-sm border border-white/10"
                                style={{ backgroundColor: activeAccent }}
                                title={`Accent: ${activeAccent}`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Selected Checkmark Overlay */}
                      {isSelected && (
                        <div
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white shadow"
                          style={{ backgroundColor: activeAccent }}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Card Title & Subtitle */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-studio-text-primary">
                          {theme.name}
                        </span>
                        {theme.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-studio-card border border-studio-border text-studio-text-secondary font-mono">
                            {theme.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-studio-text-muted mt-1 leading-snug">
                        {theme.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Pilihan Warna Aksen (Highlight / Selection Color) */}
          <div className="pt-3 border-t border-studio-border space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-studio-text-secondary flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-studio-blue-light" />
              <span>Warna Aksen & Highlight (Selection Blue / Keyframe)</span>
            </label>

            <div className="flex flex-wrap gap-2">
              {ACCENT_PRESETS.map((accent) => {
                const isSelected = selectedAccentId === accent.id;
                return (
                  <button
                    key={accent.id}
                    onClick={() => onSelectAccent(accent.id)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-studio-card border-studio-blue text-studio-text-primary shadow-sm'
                        : 'bg-studio-sidebar border-studio-border text-studio-text-secondary hover:text-studio-text-primary hover:bg-studio-card/50'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white/20"
                      style={{ backgroundColor: accent.blue }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </span>
                    <span>{accent.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-studio-border bg-studio-sidebar flex items-center justify-between">
          <span className="text-[11px] text-studio-text-muted">
            Perubahan tema diterapkan secara langsung dan otomatis tersimpan.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-studio-blue hover:bg-studio-blue-hover text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
