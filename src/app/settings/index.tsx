import { useState } from "react";
import {
  VscSymbolColor,
  VscDesktopDownload,
  VscScreenCut,
  VscShield,
  VscInfo,
  VscCheck,
} from "react-icons/vsc";
import {
  WallpaperConfig,
  getStoredWallpaper,
  setStoredWallpaper,
} from "../../system/settings/wallpaper";

export default function SettingsApp() {
  const [activeTab, setActiveTab] = useState<string>("wallpaper");
  const [selectedWallpaper, setSelectedWallpaper] = useState<string>(getStoredWallpaper);

  const [userInfo] = useState({
    name: "Alex Morgan",
    enrollment: "EN2026984510",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  });

  const handleSelectWallpaper = (val: string) => {
    setSelectedWallpaper(val);
    setStoredWallpaper(val);
  };

  const menuItems = [
    { id: "wallpaper", label: "Wallpaper", icon: VscSymbolColor },
    { id: "display", label: "Display", icon: VscScreenCut },
    { id: "appearance", label: "Appearance", icon: VscDesktopDownload },
    { id: "security", label: "Privacy & Security", icon: VscShield },
    { id: "about", label: "About System", icon: VscInfo },
  ];

  return (
    <div className="flex h-full w-full bg-[#12141d] text-white select-none overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 bg-[#171925]/80 p-4 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
            <img
              src={userInfo.avatar}
              alt="Avatar"
              className="w-11 h-11 rounded-full object-cover bg-blue-500/20 ring-2 ring-blue-500/40"
            />
            <div className="flex flex-col min-w-0">
              <h4 className="text-xs font-semibold text-white truncate">{userInfo.name}</h4>
              <span className="text-[10px] text-white/50 tracking-tight truncate">
                {userInfo.enrollment}
              </span>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="text-[10px] text-white/30 text-center ">
          macOS Web OS v1.0
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-auto bg-[#11131c]">
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
                    onClick={() => handleSelectWallpaper(wall.value)}
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
    </div>
  );
}