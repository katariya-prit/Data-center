import { VscCheck } from "react-icons/vsc";
import { WallpaperConfig } from "../../../system/settings/wallpaper";

interface AppProps {
  activeTab: string;
  selectedWallpaper: string;
  onSelectWallpaper: (val: string) => void;
}

export default function SettingsApp({ activeTab, selectedWallpaper, onSelectWallpaper }: AppProps) {
  return (
    <div className="h-full p-6 overflow-auto">
      {activeTab === "wallpaper" && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Desktop Wallpaper</h2>
            <p className="text-xs text-white/50 mt-1">
              Choose a linear gradient background theme for your system.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {WallpaperConfig.DEFAULT_THEMES.map((wall) => {
              const isSelected = selectedWallpaper === wall.value;
              return (
                <div
                  key={wall.id}
                  onClick={() => onSelectWallpaper(wall.value)}
                  className={`group relative h-36 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    isSelected
                      ? "border-blue-500 ring-4 ring-blue-500/20 scale-[1.01]"
                      : "border-white/10 hover:border-white/30"
                  }`}
                  style={{ background: wall.value }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex items-end justify-between">
                    <span className="text-xs font-medium text-white drop-shadow">{wall.name}</span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <VscCheck size={12} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}