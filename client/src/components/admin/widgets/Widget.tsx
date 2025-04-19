import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDragContext } from '@/components/admin/widgets/drag-context';
import { GripVertical, X } from 'lucide-react';

export interface WidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  onRemove: (id: string) => void;
  index: number;
}

const Widget: React.FC<WidgetProps> = ({
  id,
  title,
  children,
  icon,
  className = '',
  onRemove,
  index
}) => {
  const { setDraggedWidgetId } = useDragContext();

  const handleDragStart = (e: React.DragEvent) => {
    setDraggedWidgetId(id);
    // Required for Firefox
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedWidgetId(null);
  };

  return (
    <Card className={`mb-6 ${className}`} draggable={true} data-index={index} data-id={id}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center">
          <div 
            className="cursor-grab mr-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm font-medium flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </CardTitle>
        </div>
        <button 
          onClick={() => onRemove(id)}
          className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors inline-flex items-center justify-center"
          title="Remove widget"
        >
          <X className="h-3 w-3" />
        </button>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default Widget;