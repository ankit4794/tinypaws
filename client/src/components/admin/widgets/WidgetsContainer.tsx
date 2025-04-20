import React, { useState, useEffect } from 'react';
import { DragProvider, useDragContext } from './drag-context';

interface WidgetsContainerProps {
  children: React.ReactNode;
  widgetIds: string[];
  onReorder?: (widgetIds: string[]) => void;
}

const WidgetsContainer: React.FC<WidgetsContainerProps> = ({
  children,
  widgetIds,
  onReorder
}) => {
  return (
    <DragProvider>
      <WidgetDropZone widgetIds={widgetIds} onReorder={onReorder}>
        {children}
      </WidgetDropZone>
    </DragProvider>
  );
};

interface WidgetDropZoneProps {
  children: React.ReactNode;
  widgetIds: string[];
  onReorder?: (widgetIds: string[]) => void;
}

const WidgetDropZone: React.FC<WidgetDropZoneProps> = ({
  children,
  widgetIds,
  onReorder
}) => {
  const { draggedWidgetId } = useDragContext();
  const [orderedWidgetIds, setOrderedWidgetIds] = useState<string[]>(widgetIds);

  // Update local state when widgetIds prop changes
  useEffect(() => {
    setOrderedWidgetIds(widgetIds);
  }, [widgetIds]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Get all widget elements
    const container = e.currentTarget;
    const widgets = Array.from(container.querySelectorAll('[data-id]'));
    
    // Find the target element (where we're dropping)
    const targetElement = e.target as HTMLElement;
    const dropTarget = targetElement.closest('[data-id]') as HTMLElement;
    
    if (!dropTarget || !draggedWidgetId) return;
    
    // Get the indices
    const draggedIndex = widgets.findIndex(w => w.getAttribute('data-id') === draggedWidgetId);
    const dropIndex = widgets.findIndex(w => w === dropTarget);
    
    if (draggedIndex === -1 || dropIndex === -1 || draggedIndex === dropIndex) return;
    
    // Create new order
    const newOrder = [...orderedWidgetIds];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, removed);
    
    setOrderedWidgetIds(newOrder);
    
    // Notify parent
    if (onReorder) {
      onReorder(newOrder);
    }
  };

  return (
    <div 
      className={`transition-colors ${draggedWidgetId ? 'bg-muted/20 rounded-lg p-2' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};

export default WidgetsContainer;