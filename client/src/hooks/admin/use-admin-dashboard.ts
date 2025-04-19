import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '../../lib/queryClient';

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  recentOrders: any[]; // Using 'any' as we don't have the Order type defined here
}

export function useAdminDashboard() {
  return useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard'],
    queryFn: getQueryFn({ on401: 'throw' }), // If not authenticated, throw error
    retry: false, // Don't retry on 401s
  });
}