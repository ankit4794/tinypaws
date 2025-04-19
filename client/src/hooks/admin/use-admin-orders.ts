import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, getQueryFn, queryClient } from '../../lib/queryClient';
import { Order } from '@/shared/schema';

export interface OrdersResponse {
  orders: Order[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export interface OrderDetailResponse extends Order {
  items: any[]; // Order items
  user: {
    id: string | number;
    username: string;
    email: string;
    fullName?: string;
  } | null;
}

export function useAdminOrders(page = 1, limit = 10, status = '') {
  const queryKey = ['/api/admin/orders', { page, limit, status }];

  const query = useQuery<OrdersResponse>({
    queryKey,
    queryFn: getQueryFn({ on401: 'throw' }),
    retry: false,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string | number, status: string }) => {
      const res = await apiRequest('PUT', `/api/admin/orders/${id}`, { status });
      return await res.json() as Order;
    },
    onSuccess: () => {
      // Invalidate the orders list query after updating order status
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
    },
  });

  return {
    query,
    updateOrderStatusMutation,
  };
}

export function useAdminOrderDetail(id: string | number) {
  return useQuery<OrderDetailResponse>({
    queryKey: ['/api/admin/orders', id],
    queryFn: getQueryFn({ on401: 'throw' }),
    retry: false,
    enabled: !!id, // Only run the query if id is provided
  });
}