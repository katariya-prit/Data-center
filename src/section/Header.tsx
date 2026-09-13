import { useLocation } from "react-router-dom";
import { VscChevronRight } from "react-icons/vsc";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/theme/ThemeToggle";

export default function Header() {
  const location = useLocation();
  const { user } = useAuth();

  const breadcrumb =
    location.pathname
      .split("/")
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join("  /  ") || "Dashboard";

  return (
    <header className="flex h-11 flex-shrink-0 items-center justify-between bg-[var(--color-bg)] px-4 shadow-[0_4px_12px_-4px_var(--shadow-dark)]">
      <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
        <VscChevronRight size={12} />
        <span>{breadcrumb}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[13px] text-[var(--color-text-muted)]">{user?.enrollment}</span>
        <ThemeToggle />
      </div>
    </header>
  );
}