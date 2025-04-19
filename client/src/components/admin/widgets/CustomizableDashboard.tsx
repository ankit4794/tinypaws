import React from 'react';
import { 
  WidgetsContainer, 
  WidgetSelector,
  WidgetFactory
} from '@/components/admin/widgets';
import { useDashboardWidgets } from '@/hooks/use-dashboard-widgets';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

const CustomizableDashboard: React.FC = () => {
  const {
    activeWidgets,
    availableWidgets,
    addWidget,
    removeWidget,
    reorderWidgets,
    resetToDefaults
  } = useDashboardWidgets();

  // Handle widget reordering
  const handleReorder = (widgetIds: string[]) => {
    reorderWidgets(widgetIds);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <WidgetSelector
            availableWidgets={availableWidgets}
            onAddWidget={addWidget}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={resetToDefaults}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Default Layout
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.reload()}>
                Refresh Dashboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Display message when no widgets are active */}
      {activeWidgets.length === 0 && (
        <div className="bg-muted rounded-lg p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Your dashboard is empty. Add widgets to get started.
          </p>
          <WidgetSelector
            availableWidgets={availableWidgets}
            onAddWidget={addWidget}
          />
        </div>
      )}

      {/* Display active widgets */}
      {activeWidgets.length > 0 && (
        <WidgetsContainer
          widgetIds={activeWidgets.map((w) => w.id)}
          onReorder={handleReorder}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeWidgets
              .filter((w) => 
                w.type.startsWith('stat_')
              )
              .map((widget, index) => (
                <WidgetFactory
                  key={widget.id}
                  config={widget}
                  index={index}
                  onRemove={removeWidget}
                />
              ))}
          </div>

          {/* Full-width widgets */}
          {activeWidgets
            .filter((w) => 
              !w.type.startsWith('stat_')
            )
            .map((widget, index) => (
              <WidgetFactory
                key={widget.id}
                config={widget}
                // Use higher index to ensure they appear after stat widgets
                index={activeWidgets.length + index}
                onRemove={removeWidget}
              />
            ))}
        </WidgetsContainer>
      )}
    </div>
  );
};

export default CustomizableDashboard;