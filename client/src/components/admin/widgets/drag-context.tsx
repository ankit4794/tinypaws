import React, { createContext, useState, useEffect } from 'react';

// Simulate react-beautiful-dnd behavior for this example
// In a real implementation, you would use react-beautiful-dnd or @dnd-kit/core

export interface DraggableProvided {
  innerRef: React.RefObject<HTMLDivElement>;
  draggableProps: React.HTMLAttributes<HTMLDivElement>;
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>;
}

export interface DroppableProvided {
  innerRef: React.RefObject<HTMLDivElement>;
  droppableProps: React.HTMLAttributes<HTMLDivElement>;
}

interface DragContextType {
  items: string[];
  reorderItems: (startIndex: number, endIndex: number) => void;
}

export const DragContext = createContext<DragContextType>({
  items: [],
  reorderItems: () => {},
});

interface DragProviderProps {
  initialItems: string[];
  onReorder?: (items: string[]) => void;
  children: React.ReactNode;
}

export const DragProvider: React.FC<DragProviderProps> = ({
  initialItems,
  onReorder,
  children,
}) => {
  const [items, setItems] = useState<string[]>(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const reorderItems = (startIndex: number, endIndex: number) => {
    const result = Array.from(items);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    setItems(result);
    if (onReorder) {
      onReorder(result);
    }
  };

  return (
    <DragContext.Provider value={{ items, reorderItems }}>
      {children}
    </DragContext.Provider>
  );
};

interface DraggableProps {
  id: string;
  index: number;
  children: (provided: DraggableProvided) => React.ReactNode;
}

export const Draggable: React.FC<DraggableProps> = ({ children, id, index }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const provided: DraggableProvided = {
    innerRef: ref,
    draggableProps: {
      style: {
        position: 'relative',
      },
    },
    dragHandleProps: {
      style: {
        cursor: 'grab',
      },
    },
  };

  return <>{children(provided)}</>;
};

interface DroppableProps {
  id: string;
  children: (provided: DroppableProvided) => React.ReactNode;
}

export const Droppable: React.FC<DroppableProps> = ({ children, id }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const provided: DroppableProvided = {
    innerRef: ref,
    droppableProps: {
      style: {
        minHeight: '100px',
      },
    },
  };

  return <>{children(provided)}</>;
};