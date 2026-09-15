import { useState, useEffect } from "react";
import { useSearchGuid } from "../../system/searchGuid";
import { WallpaperConfig, getStoredWallpaper } from "../../system/settings/wallpaper";

export default function Dashboard() {
  let searchContext;
  try {
    searchContext = useSearchGuid();
  } catch (e) {
    searchContext = null;
  }

  const [time, setTime] = useState(new Date());
  const [wallpaper, setWallpaper] = useState<string>(getStoredWallpaper);

  useEffect(() => {
    const updateWallpaper = () => {
      setWallpaper(getStoredWallpaper());
    };

    window.addEventListener(WallpaperConfig.EVENT_NAME, updateWallpaper);
    window.addEventListener("storage", updateWallpaper);

    return () => {
      window.removeEventListener(WallpaperConfig.EVENT_NAME, updateWallpaper);
      window.removeEventListener("storage", updateWallpaper);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // macOS Lockscreen Style: AM/PM વગર ક્લીન 05:18 કે 17:18 ફોર્મેટ
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  // MONDAY, SEP 14 જેવો જ અપરકેસ લુક
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (searchContext) {
      searchContext.toggle();
    } else {
      console.warn("SearchGuidProvider is missing in parent tree!");
    }
  };

  return (
    <div 
      onDoubleClick={handleDoubleClick}
      className="flex-1 w-full h-full relative overflow-hidden flex flex-col items-center justify-start pt-20 select-none cursor-default"
    >
      <div
        className="absolute inset-0 transition-all duration-500 -z-10 pointer-events-none"
        style={{ background: wallpaper }}
      />
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[0.5px] -z-10 pointer-events-none" />

      <div className="flex flex-col items-center justify-center z-10 pointer-events-none space-y-1">
        <h1 className="text-[9.5rem] leading-none font-semibold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.15)] font-sans">
          {formatTime(time)}
        </h1>
        <p className="text-sm font-semibold tracking-[0.25em] text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          {formatDate(time)}
        </p>
      </div>
    </div>
  );
}