import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { navItems } from "../../section/navItems";
import { useSystemTab } from "../tab/TabContext";
import type { SearchResultItem } from "./types";

// Same colorful-squircle icon look as GlobalDock, so results feel consistent
// with the dock's app icons.
const ICON_BASE = "https://unpkg.com/lucide-static@latest/icons";
const getIconUrl = (name: string) => `${ICON_BASE}/${name}.svg`;

const APP_ICON_MAP: Record<string, { icon: string; gradient: string }> = {
  dashboard: { icon: "layout-dashboard", gradient: "linear-gradient(160deg, #6dd5ed, #2193b0)" },
  groups: { icon: "users", gradient: "linear-gradient(160deg, #a18cd1, #6a5af9)" },
  lessons: { icon: "book-open", gradient: "linear-gradient(160deg, #4ade80, #16a34a)" },
  users: { icon: "user-round", gradient: "linear-gradient(160deg, #ff9a9e, #f4517a)" },
  "code-editor": { icon: "square-terminal", gradient: "linear-gradient(160deg, #4b5563, #1f2937)" },
  settings: { icon: "settings", gradient: "linear-gradient(160deg, #9aa5b1, #5f6875)" },
};
const FALLBACK_APP_ICON = { icon: "app-window", gradient: "linear-gradient(160deg, #9aa5b1, #616b77)" };

function AppTile({ config }: { config: { icon: string; gradient: string } }) {
  return (
    <div className="search-result-tile" style={{ background: config.gradient }}>
      <img src={getIconUrl(config.icon)} alt="" draggable={false} />
    </div>
  );
}

/** Builds "Apps" (top-level navItems) and "Actions" (their children) results. */
export function useDefaultSearchSources(): SearchResultItem[] {
  const navigate = useNavigate();
  const { openApp } = useSystemTab();

  return useMemo(() => {
    const items: SearchResultItem[] = [];

    navItems.forEach((item) => {
      const appKey = item.key.toLowerCase();
      const config = APP_ICON_MAP[appKey] ?? FALLBACK_APP_ICON;

      items.push({
        id: `app:${appKey}`,
        title: item.label,
        subtitle: "Application",
        icon: <AppTile config={config} />,
        category: "Apps",
        keywords: [item.key, item.label],
        onSelect: () => {
          navigate(item.path);
          openApp(appKey, item.label);
        },
      });

      item.children?.forEach((child) => {
        items.push({
          id: `action:${appKey}:${child.path}`,
          title: child.label,
          subtitle: item.label,
          icon: <AppTile config={config} />,
          category: "Actions",
          keywords: [child.label, item.label],
          onSelect: () => {
            navigate(child.path);
            openApp(appKey, item.label);
          },
        });
      });
    });

    return items;
  }, [navigate, openApp]);
}