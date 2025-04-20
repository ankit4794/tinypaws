import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Mock data for UI purposes - replace with real API data
const mockTopProducts = [
  {
    id: '1',
    name: 'Royal Canin Maxi Adult Dog Food',
    image: '/placeholder-dog-food.jpg',
    sales: 147,
    revenue: 45500
  },
  {
    id: '2',
    name: 'Pedigree Pro Chicken & Vegetable',
    image: '/placeholder-pedigree.jpg',
    sales: 122,
    revenue: 32400
  },
  {
    id: '3',
    name: 'Drools Chicken & Egg Adult',
    image: '/placeholder-drools.jpg',
    sales: 98,
    revenue: 24500
  },
  {
    id: '4',
    name: 'Himalaya Healthy Pet Food',
    image: '/placeholder-himalaya.jpg',
    sales: 85,
    revenue: 19800
  }
];

const TopProductsWidget = () => {
  // Replace with actual API call
  const { data, isLoading } = useQuery({
    queryKey: ['admin-top-products'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockTopProducts;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
            <Skeleton className="ml-auto h-4 w-[60px]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data?.map((product) => (
        <div key={product.id} className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={product.image} alt={product.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {product.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-none truncate">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
          </div>
          <div className="text-sm font-medium">₹{product.revenue.toLocaleString()}</div>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full">View All Products</Button>
    </div>
  );
};

export default TopProductsWidget;