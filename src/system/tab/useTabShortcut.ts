import { useEffect } from "react";
import { useSystemTab } from "./TabContext";

export const useTabShortcut = () => {
  const { switchToNextTab, switchToPrevTab } = useSystemTab();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          switchToPrevTab();
        } else {
          switchToNextTab();
        }
        return;
      }

      if (e.shiftKey && e.key.toLowerCase() === "t" && !isTyping) {
        e.preventDefault();
        switchToNextTab();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [switchToNextTab, switchToPrevTab]);
};