import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Mock data for UI purposes - replace with real API data
const mockLowStockItems = [
  {
    id: '1',
    name: 'Royal Canin Puppy Food (3kg)',
    stock: 5,
    threshold: 10,
    category: 'Dog Food'
  },
  {
    id: '2',
    name: 'Whiskas Adult Cat Food (2kg)',
    stock: 3,
    threshold: 8,
    category: 'Cat Food'
  },
  {
    id: '3',
    name: 'Pedigree Dentastix (Large)',
    stock: 2,
    threshold: 15,
    category: 'Dog Treats'
  },
  {
    id: '4',
    name: 'Cat Litter (Premium, 5kg)',
    stock: 4,
    threshold: 12,
    category: 'Cat Supplies'
  }
];

const LowStockWidget = () => {
  // Replace with actual API call
  const { data, isLoading } = useQuery({
    queryKey: ['admin-low-stock'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockLowStockItems;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data?.map((item) => {
        const stockPercentage = (item.stock / item.threshold) * 100;
        const criticalLevel = stockPercentage <= 25;
        
        return (
          <div key={item.id} className="space-y-1">
            <div className="flex justify-between">
              <p className="text-sm font-medium leading-none">{item.name}</p>
              <Badge variant={criticalLevel ? "destructive" : "warning"}>
                {item.stock} left
              </Badge>
            </div>
            <Progress
              value={stockPercentage}
              className={criticalLevel ? "text-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">{item.category}</p>
          </div>
        );
      })}
      <Button variant="outline" size="sm" className="w-full">View All Inventory</Button>
    </div>
  );
};

export default LowStockWidget;