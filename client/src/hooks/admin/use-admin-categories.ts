import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, getQueryFn, queryClient } from '../../lib/queryClient';

// Interface for Category since we're working with MongoDB
export interface Category {
  _id: string; 
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string;
  image?: string;
  isActive: boolean;
  type?: string;
}

// Interface for creating/updating a category
export interface InsertCategory {
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string;
  image?: string;
  isActive?: boolean;
  type?: string;
}

export interface CategoryDetailResponse extends Category {
  subcategories: Category[];
}

export function useAdminCategories() {
  const queryKey = ['/api/admin/categories'];

  const query = useQuery<Category[]>({
    queryKey,
    queryFn: getQueryFn({ on401: 'throw' }),
    retry: false,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      const res = await apiRequest('POST', '/api/admin/categories', data);
      return await res.json() as Category;
    },
    onSuccess: () => {
      // Invalidate the categories list query after creating a category
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string | number, data: InsertCategory }) => {
      const res = await apiRequest('PATCH', `/api/admin/categories/${id}`, data);
      return await res.json() as Category;
    },
    onSuccess: () => {
      // Invalidate the categories list query after updating a category
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string | number) => {
      const res = await apiRequest('DELETE', `/api/admin/categories/${id}`);
      // Our endpoint returns 204 No Content, so we don't need to parse JSON
      return { success: true, id };
    },
    onSuccess: () => {
      // Invalidate the categories list query after deleting a category
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      // Also invalidate the frontend categories to update nav menus
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
  });

  return {
    query,
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  };
}

export function useAdminCategoryDetail(id: string | number) {
  return useQuery<CategoryDetailResponse>({
    queryKey: ['/api/admin/categories', id],
    queryFn: getQueryFn({ on401: 'throw' }),
    retry: false,
    enabled: !!id, // Only run the query if id is provided
  });
}