import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string;
  image?: string;
  isActive: boolean;
  type?: string;
  forPet?: string;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryWithSubcategories extends Category {
  subcategories: Category[];
  path: string;
}

export function useCategories() {
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Create a more useful hierarchical structure for the frontend
  const parentCategories = categories
    .filter((category) => !category.parentId && category.isActive)
    .map((category) => {
      const subcategories = categories.filter(
        (sub) => sub.parentId === category._id && sub.isActive
      );
      
      return {
        ...category,
        path: `/products/${category.slug}`,
        subcategories: subcategories.map((sub) => ({
          ...sub,
          path: `/products/${category.slug}/${sub.slug}`,
        })),
      };
    });

  return {
    categories,
    parentCategories,
    isLoading,
    isError,
    error,
  };
}

// Helper to get properly formatted path for a category
export function getCategoryPath(category: Category, parentSlug?: string): string {
  if (parentSlug) {
    return `/products/${parentSlug}/${category.slug}`;
  }
  return `/products/${category.slug}`;
}