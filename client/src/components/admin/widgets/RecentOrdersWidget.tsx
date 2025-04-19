import React from 'react';
import Widget, { WidgetProps } from './Widget';
import { ShoppingBag } from 'lucide-react';
import { useAdminOrders } from '@/hooks/admin';

interface RecentOrdersWidgetProps extends Omit<WidgetProps, 'children' | 'icon'> {
  limit?: number;
}

const RecentOrdersWidget: React.FC<RecentOrdersWidgetProps> = ({
  limit = 5,
  ...rest
}) => {
  const { query } = useAdminOrders(1, limit);
  const { data, isLoading, error } = query;

  return (
    <Widget {...rest} icon={<ShoppingBag className="h-4 w-4" />}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading recent orders...</p>
      ) : error ? (
        <p className="text-sm text-destructive">Error loading orders</p>
      ) : !data?.orders?.length ? (
        <p className="text-sm text-muted-foreground">No recent orders</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left font-medium p-2 text-xs">Order ID</th>
                <th className="text-left font-medium p-2 text-xs">Date</th>
                <th className="text-left font-medium p-2 text-xs">Status</th>
                <th className="text-right font-medium p-2 text-xs">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.slice(0, limit).map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="p-2 text-xs">{order.id}</td>
                  <td className="p-2 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-2 text-xs">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs 
                      ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-2 text-right text-xs">₹{order.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Widget>
  );
};

export default RecentOrdersWidget;