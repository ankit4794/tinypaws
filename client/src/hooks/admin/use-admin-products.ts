import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, getQueryFn, queryClient } from '../../lib/queryClient';
import { Product, InsertProduct } from '@/shared/schema';

export interface ProductsResponse {
  products: Product[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export function useAdminProducts(page = 1, limit = 10, search = '') {
  const queryKey = ['/api/admin/products', { page, limit, search }];

  const query = useQuery<ProductsResponse>({
    queryKey,
    queryFn: getQueryFn({ on401: 'throw' }),
    retry: false,
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const res = await apiRequest('POST', '/api/admin/products', data);
      return await res.json() as Product;
    },
    onSuccess: () => {
      // Invalidate the products list query after creating a product
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string | number, data: InsertProduct }) => {
      const res = await apiRequest('PUT', `/api/admin/products/${id}`, data);
      return await res.json() as Product;
    },
    onSuccess: () => {
      // Invalidate the products list query after updating a product
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const res = await apiRequest('DELETE', `/api/admin/products/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate the products list query after deleting a product
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
    },
  });

  return {
    query,
    createProductMutation,
    updateProductMutation,
    deleteProductMutation,
  };
}

export function useAdminProduct(id: string | number) {
  return useQuery<Product>({
    queryKey: ['/api/admin/products', id],
    queryFn: getQueryFn({ on401: 'throw' }),
    retry: false,
    enabled: !!id, // Only run the query if id is provided
  });
}