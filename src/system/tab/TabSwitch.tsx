import { useEffect, useState } from "react";
import { useSystemTab } from "./TabContext";
import { navItems } from "../../section/navItems";
import { IoFolderOpenSharp } from "react-icons/io5";

const APP_TYPE_TO_NAV_KEY: Record<string, string> = {
  explorer: "fileexplorer",
};

function getIconForAppType(appType: string) {
  const navKey = APP_TYPE_TO_NAV_KEY[appType] || appType;
  return navItems.find((item) => item.key === navKey)?.icon;
}

export default function TabSwitch() {
  const { apps, activeAppId } = useSystemTab();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key === "Tab") || (e.shiftKey && e.key.toLowerCase() === "t")) {
        setVisible(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt" || e.key === "Shift") {
        setVisible(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  if (!visible || apps.length === 0) return null;

  const activeApp = apps.find((a) => a.id === activeAppId);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-amber-600 pointer-events-none select-none">
      <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-2.5 bg-white/75 backdrop-blur-2xl border border-white/80 rounded-3xl p-3.5 shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/5">
          {apps.map((app) => {
            const Icon = getIconForAppType(app.appType) || IoFolderOpenSharp;
            const isHighlighted = app.id === activeAppId;
            return (
              <div
                key={app.id}
                className={`relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 ease-out ${
                  isHighlighted
                    ? "bg-white text-slate-900 scale-105 shadow-md border border-slate-200/80 ring-1 ring-slate-900/5"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                }`}
              >
                <Icon size={28} className="drop-shadow-sm" />
                {isHighlighted && (
                  <span className="absolute -bottom-1 h-1 w-3.5 rounded-full bg-slate-100 shadow-sm" />
                )}
              </div>
            );
          })}
        </div>

        {activeApp && (
          <div className="bg-white/85 backdrop-blur-xl border border-slate-200/80 px-4 py-1 rounded-full shadow-lg shadow-slate-900/5">
            <span className="text-xs font-semibold tracking-wide text-slate-800">
              {activeApp.title}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}