import React from "react";
import type { FileNode } from "../../../service/explorer_service";
import { Draggable } from "../../../system/drag-drop/Draggable";
import { Droppable } from "../../../system/drag-drop/Droppable";

interface GridItemProps {
    item: FileNode;
    isSelected: boolean;
    renderIcon: (name: string, type: string, viewMode: "list" | "grid") => React.ReactNode;
    onSelect: (e: React.MouseEvent) => void;
    onContextMenu: (e: React.MouseEvent) => void;
    onDoubleClick: (e: React.MouseEvent) => void;
    onDropOnFile?: (draggedItem: any, targetFolder: FileNode) => void;
}

export const FileGridItem: React.FC<GridItemProps> = ({
    item,
    isSelected,
    renderIcon,
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
            className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-all border ${
                isSelected
                    ? "bg-blue-50 border-blue-500 text-blue-600 shadow-sm"
                    : "border-transparent hover:bg-slate-100/80 text-slate-700"
            }`}
        >
            <div className="flex items-center justify-center mb-1">
                {renderIcon(item.name, item.type, "grid")}
            </div>
            <span className="text-xs font-medium text-center truncate w-full">{item.name}</span>
        </div>
    );

    // Draggable કમ્પોનન્ટથી રેપ કરો
    const draggableContent = (
        <Draggable id={item.id} type={item.type} data={item}>
            {content}
        </Draggable>
    );

    // જો ફોલ્ડર હોય, તો તેને Droppable પણ બનાવો
    if (item.type === "folder") {
        return (
            <Droppable
                className="rounded-lg"
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