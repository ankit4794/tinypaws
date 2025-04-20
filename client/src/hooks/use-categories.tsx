import { useQuery } from "@tanstack/react-query";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  type: string;
  forPet: string;
  description?: string;
  image?: string;
  displayOrder?: number;
  isActive: boolean;
  subCategories?: Category[];
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
}

export function getMainCategories(categories: Category[] | undefined) {
  if (!categories) return [];
  
  return categories.filter(cat => 
    cat.type === 'shop_for' && cat.isActive
  ).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

export function getCategoryPath(category: Category): string {
  return `/products/${category.slug}`;
}