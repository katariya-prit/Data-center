import React from "react";
import { VscClose, VscChromeMinimize, VscScreenFull } from "react-icons/vsc";

export interface WindowControllerAction {
    id: string;
    icon: React.ReactNode;
    label?: string; // title/tooltip mate
    onClick?: () => void;
    disabled?: boolean;
}

export interface WindowControllerProps {
    onClose?: () => void;
    onMinimize?: () => void;
    onMaximize?: () => void;
    size?: string; // Default: 'h-4 w-4' — traffic-light buttons ni size
    className?: string;

    /**
     * navu: RIGHT SIDE service — koi pan app potana custom action icons
     * pass kari shake (jem ke sidebar-toggle, view-options, tags, etc.).
     * WindowController potej koi hardcoded icon nathi rakhto — generic
     * "actions" data leve chhe, jem context-menu service kare chhe.
     */
    rightActions?: WindowControllerAction[];

    /** Full custom right-side content — rightActions kartaan vadhare flexibility joie to */
    rightSlot?: React.ReactNode;
}

export default function WindowController({
    onClose,
    onMinimize,
    onMaximize,
    size = "h-4 w-4",
    className = "",
    rightActions,
    rightSlot,
}: WindowControllerProps) {
    return (
        <div
            className={`flex items-center justify-between w-full select-none z-40 ${className}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center gap-2 group/buttons">
                <button
                    onClick={onClose}
                    className={`flex ${size} items-center justify-center rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 text-black transition-all cursor-pointer`}
                    title="Close"
                >
                    <VscClose size={9} className="opacity-0 group-hover/buttons:opacity-100 transition-opacity" />
                </button>

                <button
                    onClick={onMinimize}
                    className={`flex ${size} items-center justify-center rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 text-black transition-all cursor-pointer`}
                    title="Minimize"
                >
                    <VscChromeMinimize size={9} className="opacity-0 group-hover/buttons:opacity-100 transition-opacity" />
                </button>

                <button
                    onClick={onMaximize}
                    className={`flex ${size} items-center justify-center rounded-full bg-[#27c93f] hover:bg-[#27c93f]/80 text-black transition-all cursor-pointer`}
                    title="Maximize"
                >
                    <VscScreenFull size={8} className="opacity-0 group-hover/buttons:opacity-100 transition-opacity" />
                </button>
            </div>
            {(rightActions?.length || rightSlot) && (
                <div className="flex items-center gap-1">
                    {rightSlot}
                    {rightActions?.map((action) => (
                        <button
                            key={action.id}
                            onClick={action.onClick}
                            disabled={action.disabled}
                            title={action.label}
                            className={`p-1.5 rounded-md text-slate-500 transition-colors ${
                                action.disabled
                                    ? "opacity-40 cursor-not-allowed"
                                    : "hover:bg-slate-200/70 hover:text-slate-800 cursor-pointer"
                            }`}
                        >
                            {action.icon}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}