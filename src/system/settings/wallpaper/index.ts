export interface WallpaperTheme {
  id: string;
  name: string;
  value: string;
}

export class WallpaperConfig {
  static readonly STORAGE_KEY = "web_os_wallpaper";
  static readonly EVENT_NAME = "wallpaperChange";

  static readonly DEFAULT_THEMES: WallpaperTheme[] = [
    {
      id: "deep-space",
      name: "Deep Space",
      value: "linear-gradient(135deg, #0d0e15 0%, #1a1c2e 50%, #08090f 100%)",
    },
    {
      id: "macos-ventura",
      name: "macOS Ventura",
      value: "linear-gradient(135deg, #ff512f 0%, #dd2476 100%)",
    },
    {
      id: "dark-mountain",
      name: "Dark Mountain",
      value: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    },
    {
      id: "minimal-gradient",
      name: "Minimal Gradient",
      value: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #feada6 100%)",
    },
    {
      id: "aurora-glow",
      name: "Aurora Glow",
      value: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
    },
    {
      id: "midnight-purple",
      name: "Midnight Purple",
      value: "linear-gradient(135deg, #2e0854 0%, #180b30 50%, #0c061a 100%)",
    },
  ];
}

export const getStoredWallpaper = (): string => {
  return (
    localStorage.getItem(WallpaperConfig.STORAGE_KEY) ||
    WallpaperConfig.DEFAULT_THEMES[0].value
  );
};

export const setStoredWallpaper = (gradientValue: string): void => {
  localStorage.setItem(WallpaperConfig.STORAGE_KEY, gradientValue);
  window.dispatchEvent(new Event(WallpaperConfig.EVENT_NAME));
};