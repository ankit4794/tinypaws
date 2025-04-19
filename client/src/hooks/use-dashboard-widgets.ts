import { useState, useEffect } from 'react';
import { WidgetConfig, defaultWidgets } from '@/components/admin/widgets';

// LocalStorage key for saved widget configurations
const STORAGE_KEY = 'admin_dashboard_widgets';

export function useDashboardWidgets() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [activeWidgets, setActiveWidgets] = useState<WidgetConfig[]>([]);
  const [availableWidgets, setAvailableWidgets] = useState<WidgetConfig[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize widget state from localStorage or defaults
  useEffect(() => {
    const savedWidgets = localStorage.getItem(STORAGE_KEY);
    if (savedWidgets) {
      try {
        const parsedWidgets = JSON.parse(savedWidgets) as WidgetConfig[];
        setWidgets(parsedWidgets);
        setActiveWidgets(parsedWidgets);
        setAvailableWidgets(
          defaultWidgets.filter(
            (widget) => !parsedWidgets.some((w) => w.id === widget.id)
          )
        );
      } catch (error) {
        console.error('Error parsing saved widgets:', error);
        resetToDefaults();
      }
    } else {
      resetToDefaults();
    }
    setInitialized(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (initialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    }
  }, [widgets, initialized]);

  // Reset to default widgets
  const resetToDefaults = () => {
    setWidgets(defaultWidgets);
    setActiveWidgets(defaultWidgets);
    setAvailableWidgets([]);
  };

  // Add a widget to the dashboard
  const addWidget = (widgetId: string) => {
    const widgetToAdd = availableWidgets.find((w) => w.id === widgetId);
    if (widgetToAdd) {
      const newWidgets = [...widgets, widgetToAdd];
      setWidgets(newWidgets);
      setActiveWidgets(newWidgets);
      setAvailableWidgets(availableWidgets.filter((w) => w.id !== widgetId));
    }
  };

  // Remove a widget from the dashboard
  const removeWidget = (widgetId: string) => {
    const widgetToRemove = widgets.find((w) => w.id === widgetId);
    if (widgetToRemove) {
      const newWidgets = widgets.filter((w) => w.id !== widgetId);
      setWidgets(newWidgets);
      setActiveWidgets(newWidgets);
      setAvailableWidgets([...availableWidgets, widgetToRemove]);
    }
  };

  // Reorder widgets
  const reorderWidgets = (widgetIds: string[]) => {
    const reorderedWidgets = widgetIds
      .map((id) => widgets.find((w) => w.id === id))
      .filter((w): w is WidgetConfig => w !== undefined);
    
    setWidgets(reorderedWidgets);
    setActiveWidgets(reorderedWidgets);
  };

  return {
    widgets,
    activeWidgets,
    availableWidgets,
    addWidget,
    removeWidget,
    reorderWidgets,
    resetToDefaults,
  };
}