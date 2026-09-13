import React from "react";
import { useDragDrop } from "./DragDropContext";

interface DraggableProps {
  id: string;
  type: string;
  data: any;
  children: React.ReactNode;
  className?: string;
}

export const Draggable: React.FC<DraggableProps> = ({ id, type, data, children, className = "" }) => {
  const { startDrag, endDrag } = useDragDrop();

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        startDrag({ id, type, data });
        e.dataTransfer.setData("text/plain", id);
      }}
      onDragEnd={endDrag}
      className={`cursor-grab active:cursor-grabbing select-none ${className}`}
    >
      {children}
    </div>
  );
};