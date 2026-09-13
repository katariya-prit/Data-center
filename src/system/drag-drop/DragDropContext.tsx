import React, { createContext, useContext, useState } from "react";

interface DragItem {
  id: string;
  type: string;
  data: any;
}

interface DragDropContextType {
  draggedItem: DragItem | null;
  startDrag: (item: DragItem) => void;
  endDrag: () => void;
  isDragging: boolean;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export const DragDropProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);

  const startDrag = (item: DragItem) => {
    setDraggedItem(item);
  };

  const endDrag = () => {
    setDraggedItem(null);
  };

  return (
    <DragDropContext.Provider
      value={{
        draggedItem,
        startDrag,
        endDrag,
        isDragging: !!draggedItem,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
};

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) throw new Error("useDragDrop must be used within DragDropProvider");
  return context;
};