import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { InsertServiceablePincode, ServiceablePincode } from '@/shared/schema';

export interface PincodeListResponse {
  pincodes: ServiceablePincode[];
  total: number;
}

export function useAdminPincodes(page = 1, limit = 10) {
  // Fetch pincodes
  const query = useQuery<PincodeListResponse>({
    queryKey: ['/api/admin/pincodes', page, limit],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/admin/pincodes?page=${page}&limit=${limit}`);
      return res.json();
    },
  });

  // Create pincode
  const createPincodeMutation = useMutation({
    mutationFn: async (pincode: InsertServiceablePincode) => {
      const res = await apiRequest('POST', '/api/admin/pincodes', pincode);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pincodes'] });
    },
  });

  // Update pincode
  const updatePincodeMutation = useMutation({
    mutationFn: async ({ id, ...pincode }: { id: string } & Partial<InsertServiceablePincode>) => {
      const res = await apiRequest('PATCH', `/api/admin/pincodes/${id}`, pincode);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pincodes'] });
    },
  });

  // Delete pincode
  const deletePincodeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/admin/pincodes/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pincodes'] });
    },
  });

  // Check if pincode exists and is serviceable
  const checkPincodeMutation = useMutation({
    mutationFn: async (pincode: string) => {
      const res = await apiRequest('GET', `/api/pincodes/check?pincode=${pincode}`);
      return res.json();
    },
  });

  return {
    query,
    createPincodeMutation,
    updatePincodeMutation,
    deletePincodeMutation,
    checkPincodeMutation,
  };
}