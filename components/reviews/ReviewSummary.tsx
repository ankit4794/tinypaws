import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import StarRating from './StarRating';

interface ReviewSummaryProps {
  productId: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ReviewSummary = ({ 
  productId, 
  showCount = true, 
  size = 'sm',
  className = '' 
}: ReviewSummaryProps) => {
  const { data, isLoading } = useQuery({
    queryKey: [`/api/reviews/product/${productId}/summary`],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/reviews/product/${productId}/summary`);
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse flex items-center">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  if (!data || !data.totalReviews) {
    return null;
  }

  return (
    <div className={`flex items-center ${className}`}>
      <StarRating rating={data.averageRating} size={size} />
      
      {showCount && (
        <span className="ml-2 text-xs text-muted-foreground">
          ({data.totalReviews})
        </span>
      )}
    </div>
  );
};

export default ReviewSummary;