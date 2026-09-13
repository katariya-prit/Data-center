import { useState, useEffect } from "react";
import { useSearchGuid } from "../../system/searchGuid";
import { WallpaperConfig, getStoredWallpaper } from "../../system/settings/wallpaper";

export default function Dashboard() {
  
  // સેફ્ટી માટે ટ્રાય-કેચ જેવું બિહેવિયર અથવા ચેક કરી શકીએ કે કન્ટેક્સ્ટ અવેલેબલ છે કે નહીં
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

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

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
      className="flex-1 w-full h-full relative overflow-hidden p-8 flex flex-col justify-between select-none cursor-default"
    >
      {/* Dynamic System Linear Gradient Wallpaper Background */}
      <div
        className="absolute inset-0 transition-all duration-500 -z-10 pointer-events-none"
        style={{ background: wallpaper }}
      />
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] -z-10 pointer-events-none" />

      {/* Clock Widget */}
      <div className="flex flex-col items-center justify-center mt-12 z-10 pointer-events-none">
        <h1 className="text-9xl font-bold tracking-tight text-white drop-shadow-md">
          {formatTime(time)}
        </h1>
        <p className="text-base font-medium text-white/80 tracking-widest uppercase mt-2 drop-shadow">
          {formatDate(time)}
        </p>
      </div>
    </div>
  );
}