import React, { createContext, useContext, useState, useEffect } from "react";

interface ExplorerContextType {
  isOpen: boolean;
  isMinimized: boolean;
  openExplorer: () => void;
  closeExplorer: () => void;
  toggleMinimize: () => void;
}

const ExplorerContext = createContext<ExplorerContextType | undefined>(undefined);

// LocalStorage Keys
const STORAGE_KEY_OPEN = "explorer_is_open";
const STORAGE_KEY_MINIMIZED = "explorer_is_minimized";

export const ExplorerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // LocalStorage માંથી Initial State લોડ કરવી
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OPEN);
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MINIMIZED);
    return saved !== null ? JSON.parse(saved) : false;
  });

  // State બદલાય ત્યારે LocalStorage માં Auto Sync કરવું
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OPEN, JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MINIMIZED, JSON.stringify(isMinimized));
  }, [isMinimized]);

  const openExplorer = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const closeExplorer = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <ExplorerContext.Provider
      value={{ isOpen, isMinimized, openExplorer, closeExplorer, toggleMinimize }}
    >
      {children}
    </ExplorerContext.Provider>
  );
};

export const useExplorer = () => {
  const context = useContext(ExplorerContext);
  if (!context) throw new Error("useExplorer must be used within ExplorerProvider");
  return context;
};