import React from "react";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "framer-motion";
import { VscClose, VscChromeMinimize, VscScreenFull } from "react-icons/vsc";
import { useSystemTab } from "../tab/TabContext";

import ExplorerApp from "../../app/explorer";
import SettingsApp from "../../app/settings";
import CodeEditorApp from "../../app/code-editor";
import UsersApp from "../../app/users";
import { useAuth } from "../../context/AuthContext";

const APP_REGISTRY: Record<string, React.ComponentType<any>> = {
    explorer: ExplorerApp,
    settings: SettingsApp,
    "code-editor": CodeEditorApp,
    users: UsersApp,
};

function WindowInstance({ app }: { app: any }) {
    const { user } = useAuth();

    const {
        activeAppId,
        setActiveAppId,
        closeApp,
        toggleMinimizeApp,
        toggleMaximizeApp,
        updateAppBounds,
    } = useSystemTab();

    const dragControls = useDragControls();
    const ActiveComponent = APP_REGISTRY[app.appType];
    const extraProps = app.appType === "explorer" ? { diskId: user?.diskId } : {};
    const isActive = activeAppId === app.id;

    const fixedWidth = app.size?.width || 800;
    const fixedHeight = app.size?.height || 550;

    return (
        <motion.div
            onMouseDown={() => setActiveAppId(app.id)}
            drag={!app.isMaximized}
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragConstraints={{
                left: 0,
                top: 0,
                right: window.innerWidth - 100,
                bottom: window.innerHeight - 80,
            }}
            onDragEnd={(_: any, info: PanInfo) => {
                const currentX = (app.position?.x || 100) + info.offset.x;
                const currentY = (app.position?.y || 50) + info.offset.y;

                const boundedX = Math.max(0, Math.min(currentX, window.innerWidth - 150));
                const boundedY = Math.max(0, Math.min(currentY, window.innerHeight - 100));

                const newPos = { x: boundedX, y: boundedY };
                updateAppBounds(app.id, newPos, { width: fixedWidth, height: fixedHeight });
            }}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={
                app.isMaximized
                    ? {
                        opacity: 1,
                        scale: 1,
                        x: 0,
                        y: 0,
                        top: 8,       // 👈 ફુલ સ્ક્રીન વખતે થોડી જગ્યા છોડવા માટે (જો જોઈતી હોય તો 0 રાખી શકો)
                        left: 8,      // 👈 ફુલ સ્ક્રીન વખતે થોડી જગ્યા છોડવા માટે
                        width: "calc(100vw - 16px)",  // 👈 સાઇડમાં બોર્ડર દેખાય તે માટે
                        height: "calc(100vh - 16px)", // 👈 ઉપર-નીચે બોર્ડર દેખાય તે માટે
                        borderRadius: "12px",         // 🔴 ફુલ સ્ક્રીનમાં પણ રેડિયસ 12px જ રહેશે
                    }
                    : {
                        opacity: 1,
                        scale: 1,
                        x: app.position?.x || 100,
                        y: app.position?.y || 50,
                        width: fixedWidth,
                        height: fixedHeight,
                        borderRadius: "12px",
                    }
            }
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            style={{
                position: "fixed",
                zIndex: isActive ? 60 : app.zIndex || 30,
            }}
            className={`flex flex-col border transition-colors relative overflow-hidden ${isActive
                ? "border-blue-500/60 shadow-2xl shadow-black/80 ring-1 ring-blue-500/20"
                : "border-white/10 shadow-xl opacity-90"
                } bg-[#161822]/95 backdrop-blur-xl`}
        >
            {/* Header Bar */}
            <div
                onPointerDown={(e) => {
                    setActiveAppId(app.id);
                    if (!app.isMaximized) {
                        dragControls.start(e);
                    }
                }}
                onDoubleClick={() => toggleMaximizeApp(app.id)}
                className={`flex h-9 items-center justify-between border-b px-3 select-none cursor-move transition-colors ${isActive ? "bg-white/10 border-white/15" : "bg-white/5 border-white/5"
                    }`}
            >
                {/* macOS Action Buttons */}
                <div className="flex items-center gap-2 group/buttons" onPointerDown={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => closeApp(app.id)}
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff5f56] text-black transition"
                    >
                        <VscClose size={9} className="opacity-0 group-hover/buttons:opacity-100 transition-opacity" />
                    </button>
                    <button
                        onClick={() => toggleMinimizeApp(app.id)}
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ffbd2e] text-black transition"
                    >
                        <VscChromeMinimize size={9} className="opacity-0 group-hover/buttons:opacity-100 transition-opacity" />
                    </button>
                    <button
                        onClick={() => toggleMaximizeApp(app.id)}
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#27c93f] text-black transition"
                    >
                        <VscScreenFull size={8} className="opacity-0 group-hover/buttons:opacity-100 transition-opacity" />
                    </button>
                </div>

                <span className="text-xs font-semibold text-white/80 tracking-wide pointer-events-none">
                    {app.title}
                </span>

                <div className="w-12" />
            </div>

            {/* App Body */}
            <div className="flex-1 overflow-auto relative w-full h-full">
                {ActiveComponent ? <ActiveComponent {...extraProps} /> : <div className="p-4 text-white/40">App UI Loading...</div>}
            </div>
        </motion.div>
    );
}

export default function WindowManager() {
    const { apps } = useSystemTab();

    return (
        <AnimatePresence>
            {apps.map((app) => {
                if (app.isMinimized) return null;
                return <WindowInstance key={app.id} app={app} />;
            })}
        </AnimatePresence>
    );
}