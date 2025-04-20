import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Mock data for UI purposes - replace with real API data
const mockOrderStatusData = [
  { name: 'Delivered', value: 65, color: '#4CAF50' },
  { name: 'Processing', value: 15, color: '#2196F3' },
  { name: 'Shipped', value: 10, color: '#FFC107' },
  { name: 'Pending', value: 7, color: '#FF9800' },
  { name: 'Cancelled', value: 3, color: '#F44336' },
];

const OrderStatusWidget = () => {
  // Replace with actual API call
  const { data, isLoading } = useQuery({
    queryKey: ['admin-order-status'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockOrderStatusData;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[180px] w-full rounded-md" />
        <div className="flex justify-around">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value}%`, 'Orders']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 flex-wrap">
        {data?.map((status) => (
          <div key={status.name} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: status.color }}
            ></div>
            <span className="text-xs">{status.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusWidget;