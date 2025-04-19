import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Draggable } from '@/components/admin/widgets/drag-context';
import { GripVertical, X } from 'lucide-react';

export interface WidgetProps {
  id: string;
  title: string;
  index: number;
  onRemove?: (id: string) => void;
  isRemovable?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Widget: React.FC<WidgetProps> = ({
  id,
  title,
  index,
  onRemove,
  isRemovable = true,
  icon,
  children
}) => {
  return (
    <Draggable id={id} index={index}>
      {(provided) => (
        <div
          className="mb-4"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div {...provided.dragHandleProps} className="cursor-grab">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {icon && <span className="text-muted-foreground">{icon}</span>}
                  {title}
                </CardTitle>
              </div>
              {isRemovable && onRemove && (
                <button
                  onClick={() => onRemove(id)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Remove widget"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default Widget;