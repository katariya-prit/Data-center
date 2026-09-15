import { useEffect, useState } from "react";
import { useSystemTab } from "../tab/TabContext";

export function useAppSwitcherShortcut() {
  const { switchToNextTab, switchToPrevTab } = useSystemTab();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        setVisible(true);
        if (e.shiftKey) {
          switchToPrevTab();
        } else {
          switchToNextTab();
        }
        return;
      }

      if (e.shiftKey && e.key.toLowerCase() === "t") {
        const target = e.target as HTMLElement;
        const isTyping =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;
        if (isTyping) return;

        e.preventDefault();
        setVisible(true);
        switchToNextTab();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt" || e.key === "Shift") {
        setVisible(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [switchToNextTab, switchToPrevTab]);

  return visible;
}