import { NavLink } from "react-router-dom";
import { VscCircleFilled } from "react-icons/vsc";
import { navItems } from "./navItems";

interface SidebarProps {
  openKey: string;
}

export default function Sidebar({ openKey }: SidebarProps) {
  const openItem =
    navItems.find((item) => item.key === openKey) ?? navItems[0];

  /*
   * 1. Custom Dynamic Sidebar Component Render (e.g., Code Editor)
   */
  if (openItem.sidebar) {
    const CustomSidebar = openItem.sidebar;
    return (
      <aside className="flex w-60 h-full flex-shrink-0 flex-col bg-[var(--color-bg)] border-r border-[#282c3a] overflow-hidden z-10">
        <CustomSidebar />
      </aside>
    );
  }

  /*
   * 2. Default Sub-menu Sidebar Render (જો Submenu હોય તો)
   */
  if (openItem.children && openItem.children.length > 0) {
    return (
      <aside className="flex w-60 h-full flex-shrink-0 flex-col gap-3 bg-[var(--color-bg)] p-4 border-r border-[#282c3a] overflow-y-auto z-10">
        <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          {openItem.label}
        </p>

        <nav className="flex flex-col gap-1">
          {openItem.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                  isActive
                    ? "text-[var(--color-accent)] shadow-[inset_3px_3px_8px_var(--shadow-dark),inset_-3px_-3px_8px_var(--shadow-light)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <VscCircleFilled
                    size={6}
                    className={
                      isActive ? "text-[var(--color-accent)]" : "text-transparent"
                    }
                  />
                  {child.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    );
  }

  /*
   * 3. જો Sidebar કે Submenu કઈ ના હોય તો કંઈ રેન્ડર નહીં થાય (જેમ કે Main Dashboard)
   */
  return null;
}