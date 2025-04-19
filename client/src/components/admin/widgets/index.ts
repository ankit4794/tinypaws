export { default as Widget } from './Widget';
export { default as WidgetsContainer } from './WidgetsContainer';
export { default as StatWidget } from './StatWidget';
export { default as RecentOrdersWidget } from './RecentOrdersWidget';
export { default as ProductsListWidget } from './ProductsListWidget';

// Export the widget types
export enum WidgetType {
  STAT_PRODUCTS = 'stat_products',
  STAT_ORDERS = 'stat_orders',
  STAT_USERS = 'stat_users',
  RECENT_ORDERS = 'recent_orders',
  PRODUCTS_LIST = 'products_list',
}

// Widget configuration type
export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  settings?: Record<string, any>;
}

// Default widget configurations
export const defaultWidgets: WidgetConfig[] = [
  {
    id: 'products-stat',
    type: WidgetType.STAT_PRODUCTS,
    title: 'Total Products',
  },
  {
    id: 'orders-stat',
    type: WidgetType.STAT_ORDERS,
    title: 'Total Orders',
  },
  {
    id: 'users-stat',
    type: WidgetType.STAT_USERS,
    title: 'Total Customers',
  },
  {
    id: 'recent-orders',
    type: WidgetType.RECENT_ORDERS,
    title: 'Recent Orders',
    settings: { limit: 5 },
  },
  {
    id: 'products-list',
    type: WidgetType.PRODUCTS_LIST,
    title: 'Product Inventory',
    settings: { limit: 5 },
  },
];