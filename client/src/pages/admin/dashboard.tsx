import { useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import DashboardWidget from '@/components/admin/dashboard/widgets';
import { useAdminDashboard } from '@/hooks/admin/use-admin-dashboard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Widget } from '@shared/schema';
import { AdminLayout } from '@/components/admin/layout';

const ResponsiveGridLayout = WidthProvider(Responsive);

const Dashboard = () => {
  const { 
    dashboardConfig, 
    isLoading, 
    handleLayoutChange, 
    toggleWidgetVisibility,
    isUpdating
  } = useAdminDashboard();

  // Generate the layout for react-grid-layout from our widgets
  const getLayouts = () => {
    const layouts: { [key: string]: any[] } = { lg: [], md: [], sm: [] };

    if (!dashboardConfig || !dashboardConfig.widgets) return layouts;

    // Only include visible widgets in the layout
    const visibleWidgets = dashboardConfig.widgets.filter(widget => widget.isVisible);
    
    // Create layouts for different screen sizes
    layouts.lg = visibleWidgets.map(widget => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.position.w,
      h: widget.position.h,
      minW: 3,
      minH: 2
    }));

    // For medium screens, adjust the width but keep the same layout structure
    layouts.md = layouts.lg.map(item => ({
      ...item,
      w: Math.min(item.w, 6), // Max width of 6 for medium screens
    }));

    // For small screens, make widgets full width and stack them
    layouts.sm = layouts.lg.map((item, index) => ({
      ...item,
      x: 0,
      y: index * 2, // Stack widgets
      w: 6, // Full width
      h: item.h,
    }));

    return layouts;
  };

  // Function to handle layout changes when widgets are dragged/resized
  const onLayoutChange = (layout: any, layouts: any) => {
    handleLayoutChange(layout);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[500px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Edit Widgets'
            )}
          </Button>
        </div>

        {dashboardConfig?.widgets && dashboardConfig.widgets.length > 0 ? (
          <ResponsiveGridLayout
            className="layout"
            layouts={getLayouts()}
            breakpoints={{ lg: 1200, md: 768, sm: 480 }}
            cols={{ lg: 12, md: 6, sm: 6 }}
            rowHeight={120}
            onLayoutChange={onLayoutChange}
            isDraggable={!isUpdating}
            isResizable={!isUpdating}
            margin={[16, 16]}
          >
            {dashboardConfig.widgets
              .filter(widget => widget.isVisible)
              .map(widget => (
                <div key={widget.id}>
                  <DashboardWidget 
                    widget={widget} 
                    onToggleVisibility={toggleWidgetVisibility} 
                  />
                </div>
              ))}
          </ResponsiveGridLayout>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">No widgets found or all widgets are hidden.</p>
            <Button className="mt-4" variant="outline">
              Reset to Default Layout
            </Button>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Hidden Widgets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardConfig?.widgets
              .filter(widget => !widget.isVisible)
              .map(widget => (
                <div key={widget.id} className="opacity-60 hover:opacity-100 transition-opacity">
                  <DashboardWidget 
                    widget={widget} 
                    onToggleVisibility={toggleWidgetVisibility} 
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;