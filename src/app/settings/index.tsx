import { useState } from "react";
import SettingsApp from "./components/settingApp";
import Sidebar from "./components/sidebar";
import Window from "../../system/window/core/Window";
import { WindowController } from "../../system/window/core";
import { getStoredWallpaper, setStoredWallpaper } from "../../system/settings/wallpaper";

interface SettingsWindowProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export default function SettingsWindow({ onClose, onMinimize, onMaximize }: SettingsWindowProps) {
  const [activeTab, setActiveTab] = useState<string>("wallpaper");
  const [selectedWallpaper, setSelectedWallpaper] = useState<string>(getStoredWallpaper);

  const userInfo = {
    name: "Alex Morgan",
    enrollment: "EN2026984510",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  };

  const handleSelectWallpaper = (val: string) => {
    setSelectedWallpaper(val);
    setStoredWallpaper(val);
  };

  return (
    <Window
      sidebar={
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userInfo={userInfo}
          controller={<WindowController onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} />}
        />
      }
      outlet={
        <SettingsApp
          activeTab={activeTab}
          selectedWallpaper={selectedWallpaper}
          onSelectWallpaper={handleSelectWallpaper}
        />
      }
    />
  );
}