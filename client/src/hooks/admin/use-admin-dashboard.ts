import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { DashboardConfig, Widget } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useAdminDashboard() {
  const { toast } = useToast();
  
  // Fetch dashboard configuration
  const {
    data: dashboardConfig,
    isLoading,
    error,
    refetch
  } = useQuery<DashboardConfig>({
    queryKey: ['/api/admin/dashboard'],
    retry: false,
  });

  // Update widget positions
  const updateWidgetPositionsMutation = useMutation({
    mutationFn: async (widgets: { id: string, position: { x: number, y: number, w: number, h: number } }[]) => {
      const response = await apiRequest('POST', '/api/admin/dashboard/widget-positions', { widgets });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
      toast({
        title: 'Dashboard updated',
        description: 'Widget positions have been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update widget positions.',
        variant: 'destructive',
      });
    }
  });

  // Toggle widget visibility
  const toggleWidgetVisibilityMutation = useMutation({
    mutationFn: async ({ widgetId, isVisible }: { widgetId: string, isVisible: boolean }) => {
      const response = await apiRequest('POST', '/api/admin/dashboard/toggle-widget-visibility', { 
        widgetId, 
        isVisible 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
      toast({
        title: 'Widget updated',
        description: 'Widget visibility has been updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update widget visibility.',
        variant: 'destructive',
      });
    }
  });

  // Update entire dashboard configuration
  const updateDashboardMutation = useMutation({
    mutationFn: async (widgets: Widget[]) => {
      const response = await apiRequest('PUT', '/api/admin/dashboard', { widgets });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
      toast({
        title: 'Dashboard updated',
        description: 'Dashboard configuration has been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update dashboard configuration.',
        variant: 'destructive',
      });
    }
  });

  const handleLayoutChange = (layout: any) => {
    if (!dashboardConfig || !dashboardConfig.widgets) return;
    
    const updatedWidgets = dashboardConfig.widgets.map(widget => {
      const layoutItem = layout.find((l: any) => l.i === widget.id);
      if (layoutItem) {
        return {
          id: widget.id,
          position: {
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h
          }
        };
      }
      return {
        id: widget.id,
        position: widget.position
      };
    });
    
    updateWidgetPositionsMutation.mutate(updatedWidgets);
  };

  const toggleWidgetVisibility = (widgetId: string, isVisible: boolean) => {
    toggleWidgetVisibilityMutation.mutate({ widgetId, isVisible });
  };

  return {
    dashboardConfig,
    isLoading,
    error,
    refetch,
    handleLayoutChange,
    toggleWidgetVisibility,
    updateDashboard: updateDashboardMutation.mutate,
    isUpdating: updateDashboardMutation.isPending || updateWidgetPositionsMutation.isPending || toggleWidgetVisibilityMutation.isPending
  };
}