import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, getQueryFn, queryClient } from '../../lib/queryClient';
import { ContactSubmission } from '@/shared/schema';

export function useAdminContacts(resolved?: boolean) {
  const queryKey = ['/api/admin/contacts', { resolved }];

  const query = useQuery<ContactSubmission[]>({
    queryKey,
    queryFn: getQueryFn({ on401: 'throw' }),
    retry: false,
  });

  const updateContactStatusMutation = useMutation({
    mutationFn: async ({ id, isResolved }: { id: string | number, isResolved: boolean }) => {
      const res = await apiRequest('PUT', `/api/admin/contacts/${id}`, { isResolved });
      return await res.json() as ContactSubmission;
    },
    onSuccess: () => {
      // Invalidate the contacts list query after updating status
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contacts'] });
    },
  });

  return {
    query,
    updateContactStatusMutation,
  };
}