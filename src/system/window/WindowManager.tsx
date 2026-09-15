import React, { useState, useEffect } from "react";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "framer-motion";
import { useSystemTab } from "../tab/TabContext";

import ExplorerApp from "../../app/explorer";
import SettingsApp from "../../app/settings";
import CodeEditorApp from "../../app/code-editor";
import UsersApp from "../../app/users";
import TerminalApp from "../../app/terminal";
import { useAuth } from "../../context/AuthContext";
import type { FileNode } from "../../service/explorer_service";
import { VscNewFolder } from "react-icons/vsc";

const WINDOW_UI_CONFIG = {
    defaultWidth: 1100,
    defaultHeight: 520,
    windowRadius: "30px",
    maximizedRadius: "30px",
    topBarHeight: 28,

    header: {
        height: "10px",
        zIndex: 30,
        dragCursor: "cursor-grab active:cursor-grabbing",
        showOverlayOnMinimize: true
    },

    minimizedStack: {
        scale: 0.16,
        gap: 20,
        topPadding: 20,
        bottomPadding: 20,
        catcherWidth: 260,
    },

    animation: {
        duration: 0.7,
        ease: [0, 0, 0, 1.3],
    },
    bgStyle: {
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(30px) saturate(190%)",
        WebkitBackdropFilter: "blur(30px) saturate(190%)",
    },
    activeBorderClass: "border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] ring-1 ring-white/20",
    inactiveBorderClass: "border-white/10 shadow-xl opacity-80",
    dragConstraints: { left: 0, top: 28, rightOffset: 100, bottomOffset: 80 },
};

const APP_REGISTRY: Record<string, React.ComponentType<any>> = {
    explorer: ExplorerApp,
    settings: SettingsApp,
    "code-editor": CodeEditorApp,
    users: UsersApp,
    terminal: TerminalApp,
};

interface WindowInstanceProps {
    app: any;
    minIndex: number;
    minimizedTotal: number;
    minimizedScrollOffset: number;
    setMinimizedScrollOffset: React.Dispatch<React.SetStateAction<number>>;
}

function WindowInstance({ app, minIndex, minimizedTotal, minimizedScrollOffset, setMinimizedScrollOffset }: WindowInstanceProps) {
    const { user } = useAuth();
    const { activeAppId, setActiveAppId, closeApp, toggleMinimizeApp, toggleMaximizeApp, updateAppBounds, openApp } = useSystemTab();

    const dragControls = useDragControls();
    const ActiveComponent = APP_REGISTRY[app.appType];
    const isActive = activeAppId === app.id;

    let extraProps: Record<string, any> = {
        onClose: () => closeApp(app.id),
        onMinimize: () => toggleMinimizeApp(app.id),
        onMaximize: () => toggleMaximizeApp(app.id),
    };

    if (app.appType === "explorer") {
        extraProps = {
            ...extraProps,
            diskId: user?.diskId,
            onOpenInCodeEditor: (node: FileNode) => openApp("code-editor", "Code Editor", node),
        };
    } else if (app.appType === "code-editor") {
        extraProps = { ...extraProps, diskId: user?.diskId, initialFile: app.payload };
    }

    const fixedWidth = app.size?.width || WINDOW_UI_CONFIG.defaultWidth;
    const fixedHeight = app.size?.height || WINDOW_UI_CONFIG.defaultHeight;

    const scaledHeight = fixedHeight * WINDOW_UI_CONFIG.minimizedStack.scale;
    const gap = WINDOW_UI_CONFIG.minimizedStack.gap;
    const stackTop = WINDOW_UI_CONFIG.topBarHeight + WINDOW_UI_CONFIG.minimizedStack.topPadding;
    const stackBottom = window.innerHeight - WINDOW_UI_CONFIG.minimizedStack.bottomPadding;
    const availableHeight = Math.max(0, stackBottom - stackTop);
    const totalStackHeight = minimizedTotal * (scaledHeight + gap) - gap;
    const maxScroll = Math.max(0, totalStackHeight - availableHeight);
    const clampedOffset = Math.min(minimizedScrollOffset, maxScroll);

    const minimizedY = stackTop + minIndex * (scaledHeight + gap) - clampedOffset;
    const isOutOfStackView = app.isMinimized && (minimizedY + scaledHeight < stackTop || minimizedY > stackBottom);

    const handleMinimizedWheel = (e: React.WheelEvent) => {
        if (!app.isMinimized || maxScroll <= 0) return;
        e.preventDefault();
        setMinimizedScrollOffset((prev) => Math.max(0, Math.min(prev + e.deltaY, maxScroll)));
    };

    const getAnimationTarget = () => {
        if (app.isMinimized) {
            return {
                opacity: isOutOfStackView ? 0 : 1,
                scale: WINDOW_UI_CONFIG.minimizedStack.scale,
                rotate: -6,
                x: 30,
                y: minimizedY,
                width: fixedWidth,
                height: fixedHeight,
                borderRadius: WINDOW_UI_CONFIG.windowRadius,
                pointerEvents: (isOutOfStackView ? "none" : "auto") as "none" | "auto",
            };
        }

        if (app.isMaximized) {
            return {
                opacity: 1,
                scale: 1,
                rotate: 0,
                x: 0,
                y: WINDOW_UI_CONFIG.topBarHeight,
                top: 0,
                left: 0,
                width: "100vw",
                height: `calc(100vh - ${WINDOW_UI_CONFIG.topBarHeight}px)`,
                borderRadius: WINDOW_UI_CONFIG.maximizedRadius,
                pointerEvents: "auto" as "none" | "auto",
            };
        }

        return {
            opacity: 1,
            scale: 1,
            rotate: 0,
            x: app.position?.x || 100,
            y: Math.max(WINDOW_UI_CONFIG.topBarHeight, app.position?.y || 50),
            top: "auto",
            left: "auto",
            width: fixedWidth,
            height: fixedHeight,
            borderRadius: WINDOW_UI_CONFIG.windowRadius,
            pointerEvents: "auto" as "none" | "auto",
        };
    };

    return (
        <motion.div
            onWheel={handleMinimizedWheel}
            onMouseDown={() => {
                if (app.isMinimized) {
                    if (isOutOfStackView) return;
                    toggleMinimizeApp(app.id);
                }
                setActiveAppId(app.id);
            }}
            drag={!app.isMaximized && !app.isMinimized}
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragConstraints={{
                left: WINDOW_UI_CONFIG.dragConstraints.left,
                top: WINDOW_UI_CONFIG.topBarHeight,
                right: window.innerWidth - WINDOW_UI_CONFIG.dragConstraints.rightOffset,
                bottom: window.innerHeight - WINDOW_UI_CONFIG.dragConstraints.bottomOffset,
            }}
            onDragEnd={(_: any, info: PanInfo) => {
                const currentX = (app.position?.x || 100) + info.offset.x;
                const currentY = (app.position?.y || 50) + info.offset.y;
                const boundedX = Math.max(0, Math.min(currentX, window.innerWidth - 150));
                const boundedY = Math.max(WINDOW_UI_CONFIG.topBarHeight, Math.min(currentY, window.innerHeight - 100));
                updateAppBounds(app.id, { x: boundedX, y: boundedY }, { width: fixedWidth, height: fixedHeight });
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={getAnimationTarget()}
            whileHover={
                app.isMinimized && !isOutOfStackView
                    ? { scale: 0.19, rotate: 0, transition: { duration: 0.2 } }
                    : {}
            }
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{
                type: "tween",
                duration: WINDOW_UI_CONFIG.animation.duration,
                ease: WINDOW_UI_CONFIG.animation.ease,
            }}
            style={{
                position: "fixed",
                transformOrigin: "left center",
                zIndex: app.isMinimized ? 40 : (isActive ? 60 : app.zIndex || 30),
                cursor: app.isMinimized ? "pointer" : "default",
                willChange: "transform, opacity",
                ...WINDOW_UI_CONFIG.bgStyle
            }}
            className={`flex flex-col relative overflow-hidden ${app.isMinimized
                    ? "ring-2 ring-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                    : (isActive ? WINDOW_UI_CONFIG.activeBorderClass : WINDOW_UI_CONFIG.inactiveBorderClass)
                }`}
        >
            {!app.isMinimized && (
                <div
                    onPointerDown={(e) => {
                        setActiveAppId(app.id);
                        if (!app.isMaximized) dragControls.start(e);
                    }}
                    onDoubleClick={() => toggleMaximizeApp(app.id)}
                    style={{
                        height: WINDOW_UI_CONFIG.header.height,
                        zIndex: WINDOW_UI_CONFIG.header.zIndex
                    }}
                    className={`absolute top-0 left-0 right-0 ${WINDOW_UI_CONFIG.header.dragCursor}`}
                />
            )}

            {app.isMinimized && WINDOW_UI_CONFIG.header.showOverlayOnMinimize && (
                <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-[1px] flex items-center justify-center p-2 text-center select-none cursor-pointer">
                    <span className="text-sm font-semibold text-white bg-black/80 px-3 py-1.5 rounded-xl border border-white/30 shadow-2xl">
                        {app.title}
                    </span>
                </div>
            )}

            <div className="flex-1 w-full h-full relative m-0 overflow-hidden rounded-[inherit]">
                {ActiveComponent ? (
                    <ActiveComponent {...extraProps} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/80 pointer-events-none p-6">
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-2 shadow-lg">
                            <VscNewFolder className="text-xl text-white/90" />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function MinimizedScrollCatcher({
    minimizedTotal,
    minimizedScrollOffset,
    setMinimizedScrollOffset,
}: {
    minimizedTotal: number;
    minimizedScrollOffset: number;
    setMinimizedScrollOffset: React.Dispatch<React.SetStateAction<number>>;
}) {
    if (minimizedTotal === 0) return null;

    const scaledHeight = WINDOW_UI_CONFIG.defaultHeight * WINDOW_UI_CONFIG.minimizedStack.scale;
    const gap = WINDOW_UI_CONFIG.minimizedStack.gap;
    const stackTop = WINDOW_UI_CONFIG.topBarHeight + WINDOW_UI_CONFIG.minimizedStack.topPadding;
    const stackBottom = window.innerHeight - WINDOW_UI_CONFIG.minimizedStack.bottomPadding;
    const availableHeight = Math.max(0, stackBottom - stackTop);
    const totalStackHeight = minimizedTotal * (scaledHeight + gap) - gap;
    const maxScroll = Math.max(0, totalStackHeight - availableHeight);

    if (maxScroll <= 0) return null;

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        setMinimizedScrollOffset((prev) => Math.max(0, Math.min(prev + e.deltaY, maxScroll)));
    };

    return (
        <div
            onWheel={handleWheel}
            style={{
                position: "fixed",
                left: 0,
                top: stackTop,
                width: WINDOW_UI_CONFIG.minimizedStack.catcherWidth,
                height: availableHeight,
                zIndex: 35,
                pointerEvents: "auto",
            }}
        />
    );
}

export default function WindowManager() {
    const { apps } = useSystemTab();
    const [minimizedScrollOffset, setMinimizedScrollOffset] = useState(0);

    const minimizedTotal = apps.filter((a) => a.isMinimized).length;

    useEffect(() => {
        if (minimizedTotal === 0) setMinimizedScrollOffset(0);
    }, [minimizedTotal]);

    let minimizedCount = 0;

    return (
        <>
            <MinimizedScrollCatcher
                minimizedTotal={minimizedTotal}
                minimizedScrollOffset={minimizedScrollOffset}
                setMinimizedScrollOffset={setMinimizedScrollOffset}
            />
            <AnimatePresence>
                {apps.map((app) => {
                    const minIndex = app.isMinimized ? minimizedCount++ : 0;
                    return (
                        <WindowInstance
                            key={app.id}
                            app={app}
                            minIndex={minIndex}
                            minimizedTotal={minimizedTotal}
                            minimizedScrollOffset={minimizedScrollOffset}
                            setMinimizedScrollOffset={setMinimizedScrollOffset}
                        />
                    );
                })}
            </AnimatePresence>
        </>
    );
}