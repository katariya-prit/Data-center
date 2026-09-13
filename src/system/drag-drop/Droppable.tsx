import React, { useState } from "react";
import { useDragDrop } from "./DragDropContext";

interface DroppableProps {
  onDropItem: (item: any) => void;
  acceptTypes?: string[];
  children: React.ReactNode;
  className?: string;
}

export const Droppable: React.FC<DroppableProps> = ({
  onDropItem,
  acceptTypes = [],
  children,
  className = "",
}) => {
  const { draggedItem } = useDragDrop();
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;
    if (acceptTypes.length === 0 || acceptTypes.includes(draggedItem.type)) {
      setIsOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    if (draggedItem) {
      if (acceptTypes.length === 0 || acceptTypes.includes(draggedItem.type)) {
        onDropItem(draggedItem);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${className} ${isOver ? "ring-2 ring-blue-500/50 bg-blue-500/10 transition-all" : ""}`}
    >
      {children}
    </div>
  );
};