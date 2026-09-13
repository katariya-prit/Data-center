import { useEffect } from "react";
import { useSystemTab } from "./TabContext";

export const useTabShortcut = () => {
  const { switchToNextTab, switchToPrevTab } = useSystemTab();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + Tab (Next)
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          switchToPrevTab();
        } else {
          switchToNextTab();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [switchToNextTab, switchToPrevTab]);
};