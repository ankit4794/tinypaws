import React, { useState } from 'react';
import { 
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { WidgetConfig } from './index';

interface WidgetSelectorProps {
  availableWidgets: WidgetConfig[];
  onAddWidget: (widgetId: string) => void;
}

const WidgetSelector: React.FC<WidgetSelectorProps> = ({ 
  availableWidgets, 
  onAddWidget 
}) => {
  const [selectedWidgetId, setSelectedWidgetId] = useState<string>('');
  const [open, setOpen] = useState(false);

  const handleAddWidget = () => {
    if (selectedWidgetId) {
      onAddWidget(selectedWidgetId);
      setSelectedWidgetId('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="mb-4">
          <Plus className="h-4 w-4 mr-2" />
          Add Widget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Dashboard Widget</DialogTitle>
          <DialogDescription>
            Select a widget to add to your dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {availableWidgets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              All available widgets are already on your dashboard.
            </p>
          ) : (
            <Select 
              value={selectedWidgetId} 
              onValueChange={setSelectedWidgetId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a widget" />
              </SelectTrigger>
              <SelectContent>
                {availableWidgets.map((widget) => (
                  <SelectItem key={widget.id} value={widget.id}>
                    {widget.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button 
            variant="secondary" 
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddWidget}
            disabled={!selectedWidgetId || availableWidgets.length === 0}
          >
            Add Widget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetSelector;