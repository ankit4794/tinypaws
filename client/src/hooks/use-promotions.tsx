import { useMutation } from '@tanstack/react-query';
import { PromotionType } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export interface ApplyPromotionParams {
  code: string;
  cartTotal: number;
}

export interface PromotionResponse {
  isValid: boolean;
  message: string;
  discount: number;
  discountedTotal: number;
  code?: string;
  name?: string;
  type?: PromotionType;
}

/**
 * Hook for validating and applying a promotion code
 */
export function useApplyPromotion() {
  return useMutation({
    mutationFn: async ({ code, cartTotal }: ApplyPromotionParams) => {
      const res = await apiRequest('POST', '/api/promotions/apply', {
        code,
        cartTotal
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to apply promotion code');
      }
      
      return await res.json() as PromotionResponse;
    }
  });
}

/**
 * Hook for checking promotion code validity without applying it
 */
export function useCheckPromotion() {
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest('GET', `/api/promotions/check/${code}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Invalid promotion code');
      }
      
      return await res.json();
    }
  });
}