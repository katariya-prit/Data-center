import React from "react";
import {
  VscSymbolColor,
  VscDesktopDownload,
  VscScreenCut,
  VscShield,
  VscInfo,
} from "react-icons/vsc";

export interface SettingsUserInfo {
  name: string;
  enrollment: string;
  avatar: string;
}

interface SidebarProps {
  activeTab: string;
  onSelectTab: (id: string) => void;
  userInfo: SettingsUserInfo;
  controller?: React.ReactNode;
}

const MENU_ITEMS = [
  { id: "wallpaper", label: "Wallpaper", icon: VscSymbolColor },
  { id: "display", label: "Display", icon: VscScreenCut },
  { id: "appearance", label: "Appearance", icon: VscDesktopDownload },
  { id: "security", label: "Privacy & Security", icon: VscShield },
  { id: "about", label: "About System", icon: VscInfo },
];

export default function Sidebar({ activeTab, onSelectTab, userInfo, controller }: SidebarProps) {
  return (
    <div className="m-1 w-60 h-full shrink-0 rounded-4xl shadow-2xl overflow-hidden p-4 flex flex-col justify-between">
      {controller && <div className="flex items-center pb-3 mb-1">{controller}</div>}
      <div className="flex flex-col gap-5 flex-1 overflow-y-auto">
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
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
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

      <div className="text-[10px] text-white/30 text-center">
        macOS Web OS v1.0
      </div>
    </div>
  );
}