import { useQuery, useMutation } from '@tanstack/react-query';
import { PromotionType } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Types
export interface Promotion {
  _id: string;
  name: string;
  code: string;
  type: PromotionType;
  value: number;
  isPercentage: boolean;
  minOrderValue: number;
  maxDiscount?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  startDate: string;
  endDate: string;
  usageLimit?: number;
  perUserLimit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreatePromotionPayload = Omit<Promotion, '_id' | 'createdAt' | 'updatedAt'>;

export interface UpdatePromotionPayload {
  id: string;
  data: Partial<CreatePromotionPayload>;
}

// Fetch all promotions
export function useAdminPromotions() {
  return useQuery({
    queryKey: ['/api/admin/promotions'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/promotions');
      return await res.json();
    },
  });
}

// Fetch a single promotion by ID
export function usePromotion(id: string) {
  return useQuery({
    queryKey: ['/api/admin/promotions', id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/admin/promotions/${id}`);
      return await res.json();
    },
    enabled: !!id,
  });
}

// Create a new promotion
export function useCreatePromotion() {
  return useMutation({
    mutationFn: async (data: CreatePromotionPayload) => {
      const res = await apiRequest('POST', '/api/admin/promotions', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions'] });
    },
  });
}

// Update an existing promotion
export function useUpdatePromotion() {
  return useMutation({
    mutationFn: async ({ id, data }: UpdatePromotionPayload) => {
      const res = await apiRequest('PUT', `/api/admin/promotions/${id}`, data);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions', variables.id] });
    },
  });
}

// Delete a promotion
export function useDeletePromotion() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/admin/promotions/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions'] });
    },
  });
}