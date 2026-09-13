import { motion } from "motion/react";
import { VscSignOut } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { navItems } from "./navItems";
import type { NavItem } from "./navItems";

interface ActivityBarProps {
  openKey: string;
  onSelect: (key: string) => void;
}

export default function ActivityBar({ openKey, onSelect }: ActivityBarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleClick(item: NavItem) {
    onSelect(item.key);
    if (item.path) {
      navigate(item.path);
    }
  }

  return (
    <aside className="flex w-14 flex-shrink-0 flex-col items-center justify-between bg-[var(--color-bg)] py-4 shadow-[4px_0_12px_-4px_var(--shadow-dark)]">
      <div className="flex flex-col gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === openKey;
          return (
            <motion.button
              key={item.key}
              type="button"
              onClick={() => handleClick(item)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.92 }}
              title={item.label}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                isActive
                  ? "text-[var(--color-accent)] shadow-[inset_4px_4px_10px_var(--shadow-dark),inset_-4px_-4px_10px_var(--shadow-light)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="activity-indicator"
                  className="absolute -left-2 h-5 w-[3px] rounded-full bg-[var(--color-accent)]"
                />
              )}
              <Icon size={20} />
            </motion.button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-panel)] text-[11px] font-semibold text-[var(--color-accent)] shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)]">
          {user?.enrollment ? user.enrollment.slice(0, 2).toUpperCase() : "ME"}
        </div>
        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.92 }}
          onClick={logout}
          title="Logout"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-text-muted)] outline-none transition-colors hover:text-red-400 focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <VscSignOut size={18} />
        </motion.button>
      </div>
    </aside>
  );
}