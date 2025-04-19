import React from 'react';
import { DragProvider, Droppable } from './drag-context';

interface WidgetsContainerProps {
  widgetIds: string[];
  onReorder?: (widgetIds: string[]) => void;
  children: React.ReactNode;
}

const WidgetsContainer: React.FC<WidgetsContainerProps> = ({
  widgetIds,
  onReorder,
  children,
}) => {
  return (
    <DragProvider initialItems={widgetIds} onReorder={onReorder}>
      <Droppable id="widgets-container">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-4"
          >
            {children}
          </div>
        )}
      </Droppable>
    </DragProvider>
  );
};

export default WidgetsContainer;