import React, { createContext, useContext, useState, useEffect } from "react";

export type AppType = "explorer" | "settings" | "code-editor" | "profile" | string;

export interface AppMetadata {
  id: string;
  appType: AppType;
  title: string;
  icon?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
  payload?: any;
}

export interface TabContextType {
  apps: AppMetadata[];
  activeAppId: string | null;
  openApp: (appType: AppType, title: string, payload?: any) => void;
  closeApp: (id: string) => void;
  toggleMinimizeApp: (id: string) => void;
  toggleMaximizeApp: (id: string) => void;
  setActiveAppId: (id: string) => void;
  updateAppBounds: (id: string, position: { x: number; y: number }, size: { width: number; height: number }) => void;
  switchToNextTab: () => void;
  switchToPrevTab: () => void;
  minimizeAllApps: () => void;
  closeAllApps: () => void;
}

export type SystemTabContextType = TabContextType;

const STORAGE_KEY = "WEB_OS_APPS_METADATA_V1";

const DEFAULT_APPS: AppMetadata[] = [
  {
    id: "app-explorer-1",
    appType: "explorer",
    title: "File Explorer",
    position: { x: 10, y: 80 },
    size: { width: 800, height: 500 },
    isMaximized: false,
    isMinimized: false,
    zIndex: 40,
  },
];

const TabContext = createContext<TabContextType | undefined>(undefined);

export const TabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apps, setApps] = useState<AppMetadata[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_APPS;
    } catch {
      return DEFAULT_APPS;
    }
  });

  const [activeAppId, setActiveAppIdState] = useState<string | null>(() => {
    return apps.length > 0 ? apps[0].id : null;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    } catch (e) {
      console.error("Failed to save OS layout state", e);
    }
  }, [apps]);

  // વિન્ડોને એક્ટિવ કરવી તથા મિનિમાઇઝમાંથી બહાર લાવવી
  const setActiveAppId = (id: string) => {
    setActiveAppIdState(id);
    setApps((prev) =>
      prev.map((app) =>
        app.id === id
          ? { ...app, zIndex: 50, isMinimized: false } // 👈 auto-restore on activate
          : { ...app, zIndex: 40 }
      )
    );
  };

  // એપ ઓપન કે સ્વિચ લોજિક
  const openApp = (appType: AppType, title: string, payload?: any) => {
    const existingApp = apps.find((a) => a.appType === appType);
    if (existingApp) {
      setApps((prev) =>
        prev.map((a) =>
          a.id === existingApp.id
            ? { ...a, payload, isMinimized: false, zIndex: 50 } // 👈 restore if minimized
            : { ...a, zIndex: 40 }
        )
      );
      setActiveAppIdState(existingApp.id);
    } else {
      const newAppId = `app-${appType}-${Date.now()}`;
      const newApp: AppMetadata = {
        id: newAppId,
        appType,
        title,
        position: { x: 120 + apps.length * 20, y: 70 + apps.length * 20 },
        size: { width: 1000, height: 700 },
        isMaximized: false,
        isMinimized: false,
        zIndex: 50,
        payload,
      };
      setApps((prev) => [...prev, newApp]);
      setActiveAppIdState(newAppId);
    }
  };

  const closeApp = (id: string) => {
    setApps((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      if (activeAppId === id) {
        setActiveAppIdState(filtered.length > 0 ? filtered[filtered.length - 1].id : null);
      }
      return filtered;
    });
  };

  const toggleMinimizeApp = (id: string) => {
    setApps((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const newMinimized = !app.isMinimized;
          // જો અન-મિનિમાઇઝ થઈ રહી હોય તો activeApp પણ સેટ કરી દો
          if (!newMinimized) {
            setActiveAppIdState(id);
          }
          return { ...app, isMinimized: newMinimized };
        }
        return app;
      })
    );
  };

  const toggleMaximizeApp = (id: string) => {
    setApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, isMaximized: !app.isMaximized } : app))
    );
  };

  const updateAppBounds = (id: string, position: { x: number; y: number }, size: { width: number; height: number }) => {
    setApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, position, size } : app))
    );
  };

  const switchToNextTab = () => {
    if (apps.length === 0) return;
    const currentIndex = apps.findIndex((a) => a.id === activeAppId);
    const nextIndex = (currentIndex + 1) % apps.length;
    setActiveAppId(apps[nextIndex].id);
  };

  const switchToPrevTab = () => {
    if (apps.length === 0) return;
    const currentIndex = apps.findIndex((a) => a.id === activeAppId);
    const prevIndex = (currentIndex - 1 + apps.length) % apps.length;
    setActiveAppId(apps[prevIndex].id);
  };

  const closeAllApps = () => {
    setApps([]);
    setActiveAppIdState(null);
  };

  const minimizeAllApps = () => {
    setApps((prev) => prev.map((app) => ({ ...app, isMinimized: true })));
    setActiveAppIdState(null);
  };

  return (
    <TabContext.Provider
      value={{
        apps,
        activeAppId,
        openApp,
        closeApp,
        toggleMinimizeApp,
        toggleMaximizeApp,
        setActiveAppId,
        updateAppBounds,
        switchToNextTab,
        switchToPrevTab,
        minimizeAllApps,
        closeAllApps,
      }}
    >
      {children}
    </TabContext.Provider>
  );
};

export const useSystemTab = () => {
  const context = useContext(TabContext);
  if (!context) throw new Error("useSystemTab must be used within TabProvider");
  return context;
};