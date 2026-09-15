import { useNavigate } from "react-router-dom";
import Dock, { type DockItemData } from "./Dock";
import { navItems } from "../../section/navItems";
import { useSystemTab } from "../../system/tab/TabContext";
import { useSync } from "../../system/sync/SyncContext";
import { useAuth } from "../../context/AuthContext";
import { VscSync } from "react-icons/vsc";

type IconConfig = { gradient: string };

const NAV_ICON_CONFIG: Record<string, IconConfig> = {
  users: { gradient: "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)" },
  "code-editor": { gradient: "linear-gradient(135deg, #24292e 0%, #040404 100%)" },
  terminal: { gradient: "linear-gradient(135deg, #18181b 0%, #27272a 100%)" },
  settings: { gradient: "linear-gradient(135deg, #8a9ba8 0%, #486581 100%)" },
  fileexplorer: { gradient: "linear-gradient(135deg, #3a88e9 0%, #5ea2ef 100%)" },
};

const FALLBACK_GRADIENT = "linear-gradient(135deg, #8a9ba8 0%, #486581 100%)";

function DockIcon({
  IconComponent,
  gradient,
  spinning = false,
  badge,
}: {
  IconComponent?: React.ComponentType<{ size?: number }>;
  gradient: string;
  spinning?: boolean;
  badge?: number;
}) {
  return (
    <div 
      className="dock-app-icon relative flex items-center justify-center text-white w-full h-full rounded-[22%] transition-transform duration-200 active:scale-90" 
      style={{ background: gradient }}
    >
      <div className={`flex items-center justify-center drop-shadow-md ${spinning ? "animate-spin" : ""}`}>
        {IconComponent ? <IconComponent size={24} /> : null}
      </div>

      {!!badge && badge > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg border border-white/20">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </div>
  );
}

export default function GlobalDock() {
  const navigate = useNavigate();
  const { apps, openApp, closeApp, toggleMinimizeApp, activeAppId } = useSystemTab(); // 👈 closeApp લાવો
  const { isSyncing, pendingCount, syncNow } = useSync();
  const { user } = useAuth();

  const allDockItems = navItems.map((item) => {
    const appKey = item.key.toLowerCase();
    const config = NAV_ICON_CONFIG[appKey] ?? { gradient: FALLBACK_GRADIENT };
    const targetAppType = appKey === "fileexplorer" ? "explorer" : appKey;

    const activeApp = apps.find(
      (a) => a.appType === targetAppType || a.appType.includes(targetAppType)
    );

    const isAppActive = activeApp
      ? activeApp.id === activeAppId && !activeApp.isMinimized
      : false;

    return {
      appKey,
      isRunning: !!activeApp,
      icon: <DockIcon IconComponent={item.icon} gradient={config.gradient} />,
      label: item.label,
      isActive: isAppActive,
      className: "",
      onClick: () => {
        navigate(item.path);
        if (activeApp) {
          if (activeApp.isMinimized) {
            toggleMinimizeApp(activeApp.id);
          } else if (activeApp.id === activeAppId) {
            toggleMinimizeApp(activeApp.id);
          }
        } else {
          openApp(targetAppType, item.label);
        }
      },
      // ✕ બટન પર ક્લિક કરતા જ એપ/વિન્ડો ક્લોઝ થશે
      onCloseApp: () => {
        if (activeApp) {
          closeApp(activeApp.id);
        }
      },
    };
  });

  const runningApps = allDockItems.filter((item) => item.isRunning);
  const closedApps = allDockItems.filter((item) => !item.isRunning);

  if (runningApps.length > 0 && closedApps.length > 0) {
    closedApps[0] = {
      ...closedApps[0],
      className: "dock-divider-before",
    };
  }

  const syncDockItem: DockItemData = {
    icon: (
      <DockIcon
        IconComponent={VscSync}
        gradient="linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)"
        spinning={isSyncing}
        badge={pendingCount}
      />
    ),
    label: isSyncing ? "Syncing..." : `Sync${pendingCount > 0 ? ` (${pendingCount})` : ""}`,
    isActive: false,
    isRunning: false,
    className: "dock-divider-before",
    onClick: async () => {
      if (isSyncing) return;
      const result = await syncNow(user?.diskId ?? "");
      console.log(result.message);
    },
  };

  const finalItems: DockItemData[] = [...runningApps, ...closedApps, syncDockItem];

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[99999] select-none pointer-events-auto">
      <Dock
        items={finalItems}
        panelHeight={58}
        baseItemSize={44}
        magnification={68}
        distance={140}
      />
    </div>
  );
}