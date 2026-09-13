import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import WindowManager from "../../system/window/WindowManager";
import { GlobalDock } from "../../components/dock";
import { TabProvider } from "../../system/tab/TabContext";
import { useTabShortcut } from "../../system/tab/useTabShortcut";
import { WallpaperConfig, getStoredWallpaper } from "../../system/settings/wallpaper";
import { SearchGuidProvider, SpotlightSearch } from "../../system/searchGuid"; // 👈 Spotlight Search ઇમ્પોર્ટ કરો

function KeyboardShortcutListener() {
  useTabShortcut();
  return null;
}

export default function Layout() {
  // Global Wallpaper State
  const [wallpaper, setWallpaper] = useState<string>(getStoredWallpaper);

  useEffect(() => {
    const handleWallpaperUpdate = () => {
      setWallpaper(getStoredWallpaper());
    };

    window.addEventListener(WallpaperConfig.EVENT_NAME, handleWallpaperUpdate);
    window.addEventListener("storage", handleWallpaperUpdate);

    return () => {
      window.removeEventListener(WallpaperConfig.EVENT_NAME, handleWallpaperUpdate);
      window.removeEventListener("storage", handleWallpaperUpdate);
    };
  }, []);

  return (
    <TabProvider>
      {/* 🔴 SearchGuidProvider અહીં આપવાથી તેને TabProvider અને બાકીની સિસ્ટમનો એક્સેસ મળી જશે */}
      <SearchGuidProvider>
        <KeyboardShortcutListener />
        
        {/* Spotlight Search Component */}
        <SpotlightSearch />

        {/* 🔴 અહીં વૉલપેપર બેકગ્રાઉન્ડ આખી સ્ક્રીન પર લાગુ થશે */}
        <div
          className="flex h-screen w-screen overflow-hidden text-white relative transition-all duration-500 bg-cover bg-center"
          style={{ background: wallpaper }}
        >
          {/* Subtle Overlay to make text and icons readable */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] pointer-events-none z-0" />

          {/* Main View Area */}
          <main className="flex-1 overflow-hidden p-0 relative flex flex-col h-full w-full z-10">
            <Outlet />
          </main>

          {/* Dynamic Windows & Dock */}
          <WindowManager />
          <GlobalDock />
        </div>
      </SearchGuidProvider>
    </TabProvider>
  );
}