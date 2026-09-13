import { useLocation, Link } from "react-router-dom";
import { navItems } from "./navItems"; // તમારા path મુજબ સેટ રાખવું

export default function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  // ૧. અહીં ચેક થશે કે વર્તમાન URL `navItems` માં કન્સિડર થયેલ છે કે નહીં
  const activeNavItem = navItems.find((item) => {
    const itemPath = item.path.toLowerCase();
    return (
      currentPath === itemPath ||
      (itemPath !== "/dashboard" && currentPath.startsWith(`${itemPath}/`)) ||
      (item.key === "code-editor" && currentPath.includes("code-editor"))
    );
  });

  // ❌ જો વર્તમાન પેજ navItems માં ન હોય, તો સાઈડબાર નહીં આવે (null રિટર્ન થશે)
  if (!activeNavItem) {
    return null;
  }

  // ૨. Custom Sidebar (જેમ કે Code Editor Explorer)
  if (activeNavItem.sidebar) {
    const CustomSidebar = activeNavItem.sidebar;
    return (
      <aside className="w-64 h-full border-r border-[#282c3a] bg-[#151721] flex flex-col shrink-0 z-20 overflow-hidden">
        <CustomSidebar />
      </aside>
    );
  }

  // ૩. Sub-menu / Children સાઈડબાર (જેમ કે Groups, Lessons)
  if (activeNavItem.children && activeNavItem.children.length > 0) {
    return (
      <aside className="w-64 h-full border-r border-[#282c3a] bg-[#151721] p-4 flex flex-col gap-2 shrink-0 z-20 overflow-hidden">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
          {activeNavItem.label}
        </h3>
        {activeNavItem.children.map((child) => (
          <Link
            key={child.path}
            to={child.path}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              currentPath === child.path.toLowerCase()
                ? "bg-white/10 text-white font-medium"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            {child.label}
          </Link>
        ))}
      </aside>
    );
  }

  // ૪. Main Navigation Sidebar (જેમ કે Dashboard, Users, Settings માટે)
  return (
    <aside className="w-64 h-full border-r border-[#282c3a] bg-[#151721] p-4 flex flex-col gap-2 shrink-0 z-20 overflow-hidden">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">
        Navigation
      </h3>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          currentPath === item.path.toLowerCase() ||
          (item.path !== "/dashboard" && currentPath.startsWith(item.path.toLowerCase()));

        return (
          <Link
            key={item.key}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? "bg-white/10 text-white font-medium"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}