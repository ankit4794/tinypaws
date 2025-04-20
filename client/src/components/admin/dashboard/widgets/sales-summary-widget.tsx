import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// This would be actual data from your API in a real implementation
const mockData = [
  { name: 'Jan', total: 1200 },
  { name: 'Feb', total: 1800 },
  { name: 'Mar', total: 2200 },
  { name: 'Apr', total: 2600 },
  { name: 'May', total: 1800 },
  { name: 'Jun', total: 2800 },
  { name: 'Jul', total: 3000 },
  { name: 'Aug', total: 2500 },
  { name: 'Sep', total: 2800 },
  { name: 'Oct', total: 3300 },
  { name: 'Nov', total: 3600 },
  { name: 'Dec', total: 4000 },
];

const SalesSummaryWidget = () => {
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  
  // Mock API call - replace with actual data fetching
  const { data, isLoading } = useQuery({
    queryKey: ['admin-sales-summary', timeRange],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockData;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-[120px]" />
          <Skeleton className="h-8 w-[200px]" />
        </div>
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold">₹{data?.reduce((acc, item) => acc + item.total, 0).toLocaleString()}</div>
        <div className="flex space-x-2">
          <Button 
            variant={timeRange === 'weekly' ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange('weekly')}
          >
            Weekly
          </Button>
          <Button 
            variant={timeRange === 'monthly' ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange('monthly')}
          >
            Monthly
          </Button>
          <Button 
            variant={timeRange === 'yearly' ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange('yearly')}
          >
            Yearly
          </Button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip
            formatter={(value: number) => [`₹${value}`, 'Revenue']}
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          />
          <Bar dataKey="total" fill="#8884d8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesSummaryWidget;