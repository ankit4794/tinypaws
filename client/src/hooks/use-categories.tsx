import { useQuery } from "@tanstack/react-query";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  type?: string;
  forPet?: string;
  description?: string;
  image?: string;
  displayOrder?: number;
  isActive: boolean;
  subCategories?: Category[];
  parentId?: string;
}

export function useCategories() {
  const { data, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  return {
    categories: data || [],
    isLoading,
    error
  };
}

export function getMainCategories(categories: Category[] | undefined) {
  if (!categories) return [];
  
  return categories.filter(cat => 
    cat.type === 'shop_for' && cat.isActive
  ).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

export const getCategoryPath = (category: Category): string => {
  return `/products/${category.slug}`;
};