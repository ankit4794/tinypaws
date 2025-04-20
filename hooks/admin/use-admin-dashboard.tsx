import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { DashboardConfig, Widget, WidgetType } from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';

// Type for layout changes coming from react-grid-layout
type LayoutChange = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}[];

// Create default widgets for new users
const createDefaultWidgets = (): Widget[] => {
  return [
    {
      id: uuidv4(),
      type: WidgetType.SALES_SUMMARY,
      title: 'Sales Summary',
      position: { x: 0, y: 0, w: 6, h: 4 },
      isVisible: true,
    },
    {
      id: uuidv4(),
      type: WidgetType.RECENT_ORDERS,
      title: 'Recent Orders',
      position: { x: 6, y: 0, w: 6, h: 4 },
      isVisible: true,
    },
    {
      id: uuidv4(),
      type: WidgetType.LOW_STOCK,
      title: 'Low Stock Items',
      position: { x: 0, y: 4, w: 6, h: 4 },
      isVisible: true,
    },
    {
      id: uuidv4(),
      type: WidgetType.TOP_PRODUCTS,
      title: 'Top Selling Products',
      position: { x: 6, y: 4, w: 6, h: 4 },
      isVisible: true,
    },
    {
      id: uuidv4(),
      type: WidgetType.ORDER_STATUS,
      title: 'Order Status',
      position: { x: 0, y: 8, w: 4, h: 4 },
      isVisible: true,
    },
  ];
};

export const useAdminDashboard = () => {
  const { toast } = useToast();
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch dashboard configuration
  const { data: dashboardConfig, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-config'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/dashboard/config');
      const data = await res.json();
      
      // If no dashboard config exists, create default configuration
      if (!data) {
        const defaultConfig: DashboardConfig = {
          widgets: createDefaultWidgets(),
        };
        
        // Create a new dashboard config with default widgets
        await createDashboardConfigMutation.mutateAsync(defaultConfig);
        return defaultConfig;
      }
      
      return data;
    },
  });

  // Create a new dashboard configuration
  const createDashboardConfigMutation = useMutation({
    mutationFn: async (config: DashboardConfig) => {
      const res = await apiRequest('PUT', '/api/admin/dashboard', config);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['admin-dashboard-config'], data);
      toast({
        title: 'Dashboard initialized',
        description: 'Your dashboard has been set up with default widgets.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to initialize dashboard: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update widget positions
  const updateWidgetPositionsMutation = useMutation({
    mutationFn: async (widgets: { id: string; position: { x: number; y: number; w: number; h: number } }[]) => {
      const res = await apiRequest('PATCH', '/api/admin/dashboard/widget-positions', { widgets });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['admin-dashboard-config'], data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update widget positions: ${error.message}`,
        variant: 'destructive',
      });
      // Refetch to get the current state
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-config'] });
    },
  });

  // Toggle widget visibility
  const toggleWidgetVisibilityMutation = useMutation({
    mutationFn: async ({ widgetId, isVisible }: { widgetId: string; isVisible: boolean }) => {
      const res = await apiRequest('PATCH', '/api/admin/dashboard/widget-visibility', {
        widgetId,
        isVisible,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['admin-dashboard-config'], data);
      toast({
        title: 'Widget updated',
        description: 'Widget visibility has been updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update widget visibility: ${error.message}`,
        variant: 'destructive',
      });
      // Refetch to get the current state
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-config'] });
    },
  });

  // Handle layout changes (debounced)
  const handleLayoutChange = (layout: LayoutChange) => {
    if (!dashboardConfig || !dashboardConfig.widgets) return;

    // Convert react-grid-layout format to our API format
    const updatedWidgets = layout.map((item) => ({
      id: item.i,
      position: {
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
      },
    }));

    // Debounce the update to avoid too many API calls
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    setDebounceTimeout(
      setTimeout(() => {
        updateWidgetPositionsMutation.mutate(updatedWidgets);
      }, 500)
    );
  };

  // Toggle widget visibility
  const toggleWidgetVisibility = (widgetId: string, isVisible: boolean) => {
    toggleWidgetVisibilityMutation.mutate({ widgetId, isVisible });
  };

  return {
    dashboardConfig,
    isLoading,
    error,
    handleLayoutChange,
    toggleWidgetVisibility,
    isUpdating: updateWidgetPositionsMutation.isPending || toggleWidgetVisibilityMutation.isPending,
  };
};