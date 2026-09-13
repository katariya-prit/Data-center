import React, { useEffect, useRef } from "react";
import {
    VscFolderOpened,
    VscFile,
    VscNewFolder,
    VscTrash,
    VscEdit,
    VscInfo,
    VscGoToFile,
} from "react-icons/vsc";

export interface ContextMenuTarget {
    id: string | null;
    type: "file" | "folder" | "blank";
    name?: string;
}

interface ContextMenuProps {
    x: number;
    y: number;
    target: ContextMenuTarget;
    onClose: () => void;
    onOpen: () => void;
    onOpenInCodeEditor?: () => void;
    onNewFile: () => void;
    onNewFolder: () => void;
    onRename: () => void;
    onDelete: () => void;
    onProperties: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
    x,
    y,
    target,
    onClose,
    onOpen,
    onOpenInCodeEditor,
    onNewFile,
    onNewFolder,
    onRename,
    onDelete,
    onProperties,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // har action click thata j menu close thay tem wrap karyu
    const run = (fn?: () => void) => {
        fn?.();
        onClose();
    };

    return (
        <div
            ref={menuRef}
            style={{ top: y, left: x }}
            className="fixed z-50 w-48 bg-[#1a1c29]/95 border border-white/10 rounded-xl shadow-2xl py-1.5 backdrop-blur-md text-xs text-white/90 select-none"
        >
            {/* Folder par: "Open" | File par: "Open in Code Editor" */}
            {target.type === "folder" && (
                <button
                    onClick={() => run(onOpen)}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-blue-600/30 hover:text-white transition"
                >
                    <VscFolderOpened className="text-blue-400" size={15} />
                    <span>Open</span>
                </button>
            )}

            {target.type === "file" && (
                <button
                    onClick={() => run(onOpenInCodeEditor)}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-blue-600/30 hover:text-white transition"
                >
                    <VscGoToFile className="text-cyan-400" size={15} />
                    <span>Open in Code Editor</span>
                </button>
            )}

            {target.type !== "blank" && <div className="my-1 border-t border-white/10" />}

            {target.type !== "file" && (
                <>
                    <button
                        onClick={() => run(onNewFile)}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-blue-600/30 hover:text-white transition"
                    >
                        <VscFile className="text-emerald-400" size={15} />
                        <span>New File</span>
                    </button>

                    <button
                        onClick={() => run(onNewFolder)}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-blue-600/30 hover:text-white transition"
                    >
                        <VscNewFolder className="text-amber-400" size={15} />
                        <span>New Folder</span>
                    </button>
                </>
            )}

            {target.type !== "blank" && (
                <>
                    <div className="my-1 border-t border-white/10" />
                    <button
                        onClick={() => run(onRename)}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-blue-600/30 hover:text-white transition"
                    >
                        <VscEdit className="text-purple-400" size={15} />
                        <span>Rename</span>
                    </button>
                    <button
                        onClick={() => run(onDelete)}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-red-600/30 hover:text-red-300 transition"
                    >
                        <VscTrash className="text-red-400" size={15} />
                        <span>Delete</span>
                    </button>
                </>
            )}

            <div className="my-1 border-t border-white/10" />
            <button
                onClick={() => run(onProperties)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-blue-600/30 hover:text-white transition"
            >
                <VscInfo className="text-sky-400" size={15} />
                <span>Properties</span>
            </button>
        </div>
    );
};