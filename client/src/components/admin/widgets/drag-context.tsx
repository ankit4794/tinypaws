import React, { createContext, useContext, useState } from 'react';

interface DragContextType {
  draggedWidgetId: string | null;
  setDraggedWidgetId: React.Dispatch<React.SetStateAction<string | null>>;
}

const DragContext = createContext<DragContextType | undefined>(undefined);

export const DragProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);

  return (
    <DragContext.Provider value={{ draggedWidgetId, setDraggedWidgetId }}>
      {children}
    </DragContext.Provider>
  );
};

export const useDragContext = () => {
  const context = useContext(DragContext);
  if (context === undefined) {
    throw new Error('useDragContext must be used within a DragProvider');
  }
  return context;
};