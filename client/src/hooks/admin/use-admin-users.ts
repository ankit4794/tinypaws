import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, getQueryFn, queryClient } from '../../lib/queryClient';
import { User } from '@/shared/schema';

export interface UsersResponse {
  users: User[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export function useAdminUsers(page = 1, limit = 10, search = '') {
  const queryKey = ['/api/admin/users', { page, limit, search }];

  const query = useQuery<UsersResponse>({
    queryKey,
    queryFn: getQueryFn({ on401: 'throw' }),
    retry: false,
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string | number, data: Partial<User> }) => {
      const res = await apiRequest('PUT', `/api/admin/users/${id}`, data);
      return await res.json() as User;
    },
    onSuccess: () => {
      // Invalidate the users list query after updating a user
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  return {
    query,
    updateUserMutation,
  };
}

export function useAdminUserDetail(id: string | number) {
  return useQuery<User>({
    queryKey: ['/api/admin/users', id],
    queryFn: getQueryFn({ on401: 'throw' }),
    retry: false,
    enabled: !!id, // Only run the query if id is provided
  });
}