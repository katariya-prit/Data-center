import React from "react";
import type { FileNode } from "../../../service/explorer_service";
import { Draggable } from "../../../system/drag-drop/Draggable";
import { Droppable } from "../../../system/drag-drop/Droppable";

interface ListItemProps {
    item: FileNode;
    isSelected: boolean;
    renderIcon: (name: string, type: string, viewMode: "list" | "grid") => React.ReactNode;
    getFileKind: (name: string, type: string) => string;
    formatFileSize: (size: number) => string;
    onSelect: (e: React.MouseEvent) => void;
    onContextMenu: (e: React.MouseEvent) => void;
    onDoubleClick: (e: React.MouseEvent) => void;
    onDropOnFile?: (draggedItem: any, targetFolder: FileNode) => void;
}

export const FileListItem: React.FC<ListItemProps> = ({
    item,
    isSelected,
    renderIcon,
    getFileKind,
    formatFileSize,
    onSelect,
    onContextMenu,
    onDoubleClick,
    onDropOnFile,
}) => {
    const content = (
        <div
            onClick={onSelect}
            onContextMenu={onContextMenu}
            onDoubleClick={onDoubleClick}
            className={`cursor-pointer transition-colors rounded-md flex items-center py-1.5 px-4 text-xs ${
                isSelected ? "bg-[#0096fd] text-white" : "hover:bg-slate-100 text-slate-800"
            }`}
        >
            <div className="flex-1 flex items-center gap-2 font-medium truncate">
                {renderIcon(item.name, item.type, "list")}
                <span className="truncate">{item.name}</span>
            </div>
            <div className={`w-44 ${isSelected ? "text-white/90" : "text-slate-500"}`}>—</div>
            <div className={`w-24 font-mono ${isSelected ? "text-white/90" : "text-slate-500"}`}>
                {item.type === "folder" ? "--" : formatFileSize(item.metadata?.size || 0)}
            </div>
            <div className={`w-44 ${isSelected ? "text-white/90" : "text-slate-500"}`}>
                {getFileKind(item.name, item.type)}
            </div>
        </div>
    );

    const draggableContent = (
        <Draggable id={item.id} type={item.type} data={item}>
            {content}
        </Draggable>
    );

    if (item.type === "folder") {
        return (
            <Droppable
                className="rounded-md"
                onDropItem={(dragged) => {
                    if (dragged.id !== item.id && onDropOnFile) {
                        onDropOnFile(dragged, item);
                    }
                }}
            >
                {draggableContent}
            </Droppable>
        );
    }

    return draggableContent;
};