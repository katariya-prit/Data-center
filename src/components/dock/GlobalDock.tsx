import { useNavigate } from "react-router-dom";
import Dock, { type DockItemData } from "./Dock";
import { navItems } from "../../section/navItems";
import { useSystemTab } from "../../system/tab/TabContext";

type IconConfig = { gradient: string };

// દરેક એપ માટે કલર ગ્રેડિયન્ટ મેપિંગ (કી navItems ની key મુજબ છે)
const NAV_ICON_CONFIG: Record<string, IconConfig> = {
  users: { gradient: "linear-gradient(160deg, #ff9a9e, #f4517a)" },
  "code-editor": { gradient: "linear-gradient(160deg, #4b5563, #1f2937)" },
  settings: { gradient: "linear-gradient(160deg, #9aa5b1, #5f6875)" },
  fileexplorer: { gradient: "linear-gradient(160deg, #6cb6ff, #2f6fed)" },
};

const FALLBACK_GRADIENT = "linear-gradient(160deg, #9aa5b1, #616b77)";

// સીધું react-icon રેન્ડર કરવા માટેનું કમ્પોનન્ટ
function DockIcon({ 
  IconComponent, 
  gradient 
}: { 
  IconComponent?: React.ComponentType<{ size?: number }>; 
  gradient: string 
}) {
  return (
    <div className="dock-app-icon flex items-center justify-center text-white shadow-inner" style={{ background: gradient }}>
      {IconComponent ? <IconComponent size={26} /> : null}
    </div>
  );
}

export default function GlobalDock() {
  const navigate = useNavigate();
  const { apps, openApp, toggleMinimizeApp, activeAppId } = useSystemTab();

  const allDockItems: DockItemData[] = navItems.map((item) => {
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
      icon: <DockIcon IconComponent={item.icon} gradient={config.gradient} />,
      label: item.label,
      isActive: isAppActive,
      ...(appKey === "fileexplorer" ? { className: "dock-divider-before" } : {}),
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
    };
  });

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-99999 select-none">
      <Dock
        items={allDockItems}
        panelHeight={70}
        baseItemSize={50}
        magnification={80}
      />
    </div>
  );
}