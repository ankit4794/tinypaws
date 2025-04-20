import React from 'react';
import { WidgetConfig, WidgetType } from './index';
import StatWidget from './StatWidget';
import RecentOrdersWidget from './RecentOrdersWidget';
import ProductsListWidget from './ProductsListWidget';
import { Package, ShoppingBag, Users } from 'lucide-react';
import { useAdminDashboard } from '@/hooks/admin';

interface WidgetFactoryProps {
  config: WidgetConfig;
  index: number;
  onRemove: (id: string) => void;
}

const WidgetFactory: React.FC<WidgetFactoryProps> = ({ 
  config, 
  index, 
  onRemove 
}) => {
  const { data: dashboardData } = useAdminDashboard();

  switch (config.type) {
    case WidgetType.STAT_PRODUCTS:
      return (
        <StatWidget
          id={config.id}
          title={config.title}
          index={index}
          onRemove={onRemove}
          value={dashboardData?.totalProducts || 0}
          description="Across all categories"
          icon={<Package className="h-4 w-4" />}
        />
      );

    case WidgetType.STAT_ORDERS:
      return (
        <StatWidget
          id={config.id}
          title={config.title}
          index={index}
          onRemove={onRemove}
          value={dashboardData?.totalOrders || 0}
          description="Across all time"
          icon={<ShoppingBag className="h-4 w-4" />}
        />
      );

    case WidgetType.STAT_USERS:
      return (
        <StatWidget
          id={config.id}
          title={config.title}
          index={index}
          onRemove={onRemove}
          value={dashboardData?.totalUsers || 0}
          description="Registered users"
          icon={<Users className="h-4 w-4" />}
        />
      );

    case WidgetType.RECENT_ORDERS:
      return (
        <RecentOrdersWidget
          id={config.id}
          title={config.title}
          index={index}
          onRemove={onRemove}
          limit={config.settings?.limit || 5}
        />
      );

    case WidgetType.PRODUCTS_LIST:
      return (
        <ProductsListWidget
          id={config.id}
          title={config.title}
          index={index}
          onRemove={onRemove}
          limit={config.settings?.limit || 5}
        />
      );

    default:
      return null;
  }
};

export default WidgetFactory;