import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Mock data for UI purposes - replace with real API data
const mockRecentOrders = [
  {
    id: '1',
    customerName: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    amount: 4500,
    status: 'Delivered',
    date: '2023-04-15T14:30:00',
    items: 3
  },
  {
    id: '2',
    customerName: 'Priya Patel',
    email: 'priya.p@example.com',
    amount: 2800,
    status: 'Processing',
    date: '2023-04-14T11:20:00',
    items: 2
  },
  {
    id: '3',
    customerName: 'Amit Kumar',
    email: 'amit.k@example.com',
    amount: 6700,
    status: 'Shipped',
    date: '2023-04-13T09:45:00',
    items: 4
  },
  {
    id: '4',
    customerName: 'Sneha Reddy',
    email: 'sneha.r@example.com',
    amount: 1200,
    status: 'Pending',
    date: '2023-04-12T16:15:00',
    items: 1
  }
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'bg-green-500';
    case 'processing':
      return 'bg-blue-500';
    case 'shipped':
      return 'bg-yellow-500';
    case 'pending':
      return 'bg-orange-500';
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'success';
    case 'processing':
      return 'default';
    case 'shipped':
      return 'warning';
    case 'pending':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const RecentOrdersWidget = () => {
  // Replace with actual API call
  const { data, isLoading } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockRecentOrders;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data?.map((order) => (
        <div key={order.id} className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary">
              {order.customerName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-none">{order.customerName}</p>
            <p className="text-sm text-muted-foreground truncate">{order.email}</p>
          </div>
          <Badge variant={getStatusVariant(order.status) as any}>
            {order.status}
          </Badge>
          <div className="text-sm font-medium">₹{order.amount}</div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full">View All Orders</Button>
    </div>
  );
};

export default RecentOrdersWidget;