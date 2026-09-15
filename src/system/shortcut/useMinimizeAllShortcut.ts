import { useEffect } from "react";
import { useSystemTab } from "../tab/TabContext";

export function useMinimizeAllShortcut() {
  const { minimizeAllApps } = useSystemTab();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "d") {
        const target = e.target as HTMLElement;
        const isTyping =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;
        if (isTyping) return;

        e.preventDefault();
        minimizeAllApps();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [minimizeAllApps]);
}