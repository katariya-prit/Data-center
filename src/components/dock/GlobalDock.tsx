import { useNavigate, useLocation } from "react-router-dom";
import { VscFolderLibrary } from "react-icons/vsc";
import Dock, { type DockItemData } from "./Dock";
import { navItems } from "../../section/navItems";
import { useExplorer } from "../explorer";

export default function GlobalDock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, openExplorer, toggleMinimize } = useExplorer();

  // ૧. Main Navigation Items (Home, Groups, Lessons, Code Editor, Settings)
  const navDockItems: DockItemData[] = navItems.map((item) => {
    const IconComponent = item.icon;
    const isActive =
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`);

    return {
      icon: <IconComponent size={20} />,
      label: item.label,
      isActive: isActive,
      onClick: () => navigate(item.path),
    };
  });

  // ૨. File Explorer Icon
  const explorerDockItem: DockItemData = {
    icon: <VscFolderLibrary size={20} className="text-[#6cb6ff]" />,
    label: "File Explorer",
    isActive: isOpen,
    onClick: () => {
      if (!isOpen) {
        openExplorer();
      } else {
        toggleMinimize();
      }
    },
  };

  // 3. બધા આઈટમ્સ ભેગા કરો
  const allDockItems = [...navDockItems, explorerDockItem];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 select-none">
      <Dock items={allDockItems} panelHeight={56} baseItemSize={42} magnification={64} />
    </div>
  );
}