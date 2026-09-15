import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import WindowManager from "../../system/window/WindowManager";
import { GlobalDock } from "../../components/dock";
import { TopMenuBar } from "../../components/menubar/TopMenuBar";
import { TabProvider } from "../../system/tab/TabContext";
import { WallpaperConfig, getStoredWallpaper } from "../../system/settings/wallpaper";
import { SearchGuidProvider, SpotlightSearch } from "../../system/searchGuid";
import {
    AppSwitcherOverlay,
    useAppSwitcherShortcut,
    useMinimizeAllShortcut,
} from "../../system/shortcut";

function AppSwitcherListener() {
    const switcherVisible = useAppSwitcherShortcut();
    useMinimizeAllShortcut();

    return <AppSwitcherOverlay visible={switcherVisible} />;
}

export default function Layout() {
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
            <SearchGuidProvider>
                <AppSwitcherListener />
                <SpotlightSearch />
                <div
                    className="flex flex-col rounded-2xl h-screen w-screen overflow-hidden text-white relative transition-all duration-500 bg-cover bg-center select-none"
                    style={{ background: wallpaper }}
                >
                    <TopMenuBar />

                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] pointer-events-none z-0" />

                    <div className="relative flex-1 w-full overflow-hidden z-10">
                        <main className="absolute inset-0 z-0 flex flex-col overflow-hidden">
                            <Outlet />
                        </main>

                        <div id="window-workspace" className="absolute inset-0 z-10 pointer-events-none">
                            <WindowManager />
                        </div>
                    </div>

                    <div className="z-30 relative shrink-0">
                        <GlobalDock />
                    </div>
                </div>
            </SearchGuidProvider>
        </TabProvider>
    );
}