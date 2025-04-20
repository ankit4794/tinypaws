// Widget type represents the different types of widgets available
export type WidgetType = 
  | 'sales-summary' 
  | 'recent-orders' 
  | 'low-stock' 
  | 'top-products' 
  | 'order-status' 
  | 'quick-stats'
  | 'revenue-chart'
  | 'help-desk'
  | 'activity-log'
  | 'category-distribution';

// Size options for widgets
export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

// Position for widgets (for draggable grid layout)
export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Widget configuration
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: WidgetPosition;
  settings?: Record<string, any>;
  isVisible: boolean;
}

// Dashboard configuration stored for each user
export interface DashboardConfig {
  userId: string;
  widgets: Widget[];
  lastModified: Date;
}

// Default widget positions based on size
export const DEFAULT_WIDGET_POSITIONS: Record<WidgetSize, { w: number; h: number }> = {
  small: { w: 1, h: 1 },
  medium: { w: 2, h: 1 },
  large: { w: 2, h: 2 },
  full: { w: 4, h: 2 }
};

// Default widget settings
export const DEFAULT_WIDGETS: Omit<Widget, 'id' | 'position'>[] = [
  {
    type: 'quick-stats',
    title: 'Quick Stats',
    size: 'full',
    isVisible: true,
  },
  {
    type: 'sales-summary',
    title: 'Sales Summary',
    size: 'medium',
    isVisible: true,
  },
  {
    type: 'recent-orders',
    title: 'Recent Orders',
    size: 'large',
    isVisible: true,
  },
  {
    type: 'low-stock',
    title: 'Low Stock Products',
    size: 'medium',
    isVisible: true,
  },
  {
    type: 'top-products',
    title: 'Top Products',
    size: 'medium',
    isVisible: true,
  },
  {
    type: 'order-status',
    title: 'Order Status',
    size: 'medium',
    isVisible: true,
  },
  {
    type: 'revenue-chart',
    title: 'Revenue Chart',
    size: 'large',
    isVisible: true,
  },
  {
    type: 'help-desk',
    title: 'Help Desk',
    size: 'medium',
    isVisible: true,
  },
  {
    type: 'activity-log',
    title: 'Recent Activity',
    size: 'medium',
    isVisible: true,
  },
  {
    type: 'category-distribution',
    title: 'Category Distribution',
    size: 'medium',
    isVisible: true,
  }
];

// Create a default dashboard configuration
export function createDefaultDashboardConfig(userId: string): DashboardConfig {
  // Generate IDs and positions for default widgets
  const widgets: Widget[] = DEFAULT_WIDGETS.map((widget, index) => {
    const { w, h } = DEFAULT_WIDGET_POSITIONS[widget.size];
    
    // Simple layout algorithm: place widgets in a grid (4 columns)
    const x = index % 2 === 0 ? 0 : 2;
    const y = Math.floor(index / 2) * 2; // Multiply by height to avoid overlap
    
    return {
      ...widget,
      id: `widget-${widget.type}-${index}`,
      position: { x, y, w, h },
    };
  });
  
  return {
    userId,
    widgets,
    lastModified: new Date(),
  };
}