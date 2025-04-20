import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Review } from '@/shared/schema';

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
}

export interface ReviewFilterParams {
  productId?: string;
  rating?: number;
  isApproved?: boolean;
  startDate?: string;
  endDate?: string;
}

export function useAdminReviews(page = 1, limit = 10, filters: ReviewFilterParams = {}) {
  // Build query params for filtering
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });
  
  // Fetch reviews
  const query = useQuery<ReviewListResponse>({
    queryKey: ['/api/admin/reviews', page, limit, filters],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/admin/reviews?${queryParams.toString()}`);
      return res.json();
    },
  });

  // Approve review
  const approveReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await apiRequest('PATCH', `/api/admin/reviews/${reviewId}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
    },
  });

  // Reject review
  const rejectReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await apiRequest('PATCH', `/api/admin/reviews/${reviewId}/reject`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
    },
  });

  // Delete review
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await apiRequest('DELETE', `/api/admin/reviews/${reviewId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
    },
  });

  // Reply to review
  const replyToReviewMutation = useMutation({
    mutationFn: async ({ reviewId, replyText }: { reviewId: string; replyText: string }) => {
      const res = await apiRequest('POST', `/api/admin/reviews/${reviewId}/reply`, { replyText });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
    },
  });

  // Get review analytics (ratings distribution, etc.)
  const reviewAnalyticsQuery = useQuery({
    queryKey: ['/api/admin/reviews/analytics'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/reviews/analytics');
      return res.json();
    },
  });

  return {
    query,
    approveReviewMutation,
    rejectReviewMutation,
    deleteReviewMutation,
    replyToReviewMutation,
    reviewAnalyticsQuery,
  };
}