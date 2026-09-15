import { useState } from "react";
import { useSystemTab } from "../tab/TabContext";
import { navItems } from "../../section/navItems";
import { IoFolderOpenSharp } from "react-icons/io5";

const APP_TYPE_TO_NAV_KEY: Record<string, string> = {
  explorer: "fileexplorer",
};

function getIconForAppType(appType: string) {
  const navKey = APP_TYPE_TO_NAV_KEY[appType] || appType;
  return navItems.find((item) => item.key === navKey)?.icon;
}

export default function AppSwitcherOverlay({ visible }: { visible: boolean }) {
  const { apps, activeAppId, setActiveAppId } = useSystemTab();
  const [hoveredAppId, setHoveredAppId] = useState<string | null>(null);

  if (!visible || apps.length === 0) return null;

  // જો હોવર કરેલું હોય તો તે એપનું નામ બતાવો, નહિ તો એક્ટિવ એપનું નામ બતાવો
  const displayedApp = apps.find((a) => a.id === (hoveredAppId || activeAppId));

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none select-none">
      <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-150">
        <div className="pointer-events-auto flex items-center gap-2.5 bg-white/75 backdrop-blur-2xl border border-white/80 rounded-3xl p-3.5 shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/5">
          {apps.map((app) => {
            const Icon = getIconForAppType(app.appType) || IoFolderOpenSharp;
            const isSelected = app.id === activeAppId;

            return (
              <button
                key={app.id}
                onClick={() => {
                  if (setActiveAppId) {
                    setActiveAppId(app.id); // એપ પર ક્લિક કરવાથી સ્વિચ થઈ જશે
                  }
                }}
                onMouseEnter={() => setHoveredAppId(app.id)}
                onMouseLeave={() => setHoveredAppId(null)}
                className={`relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl transition-all duration-200 ease-out active:scale-95 ${
                  isSelected
                    ? "bg-white text-slate-900 scale-105 shadow-md border border-slate-200/80 ring-1 ring-slate-900/5"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/90 hover:scale-110 hover:shadow-lg hover:border hover:border-slate-200/60"
                }`}
              >
                <Icon size={28} className="drop-shadow-sm transition-transform duration-200" />
                {isSelected && (
                  <span className="absolute -bottom-1 h-1 w-3.5 rounded-full bg-slate-800 shadow-sm" />
                )}
              </button>
            );
          })}
        </div>

        {displayedApp && (
          <div className="bg-white/85 backdrop-blur-xl border border-slate-200/80 px-4 py-1 rounded-full shadow-lg shadow-slate-900/5 transition-all">
            <span className="text-xs font-semibold tracking-wide text-slate-800">
              {displayedApp.title}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}