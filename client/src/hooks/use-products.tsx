import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { getQueryFn } from "../lib/queryClient";

const LOCAL_STORAGE_PRODUCTS_KEY = "tinypaws_products";
const LOCAL_STORAGE_PRODUCT_KEY_PREFIX = "tinypaws_product_";

// Get products from localStorage if available
const getStoredProducts = (): Product[] | undefined => {
  if (typeof window === "undefined") return undefined;
  
  try {
    const storedProducts = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    return storedProducts ? JSON.parse(storedProducts) : undefined;
  } catch (error) {
    console.error("Failed to parse stored products data:", error);
    return undefined;
  }
};

// Get a specific product from localStorage if available
const getStoredProduct = (id: string | number): Product | undefined => {
  if (typeof window === "undefined") return undefined;
  
  try {
    const storedProduct = localStorage.getItem(`${LOCAL_STORAGE_PRODUCT_KEY_PREFIX}${id}`);
    return storedProduct ? JSON.parse(storedProduct) : undefined;
  } catch (error) {
    console.error(`Failed to parse stored product data for ID ${id}:`, error);
    return undefined;
  }
};

interface ProductsQueryOptions {
  category?: string;
  subcategory?: string;
  sort?: string;
  search?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useProducts(options: ProductsQueryOptions = {}) {
  const { category, subcategory, sort, search, page = 1, limit = 12, enabled = true } = options;
  
  // Build query string based on options
  let queryString = `/api/products?page=${page}&limit=${limit}`;
  if (category) queryString += `&category=${category}`;
  if (subcategory) queryString += `&subcategory=${subcategory}`;
  if (sort) queryString += `&sort=${sort}`;
  if (search) queryString += `&search=${encodeURIComponent(search)}`;
  
  // Use query key that reflects all the filter parameters
  const queryKey = ['/api/products', { category, subcategory, sort, search, page, limit }];
  
  return useQuery<Product[]>({
    queryKey,
    queryFn: getQueryFn({ on401: "throw" }),
    initialData: getStoredProducts,
    onSuccess: (data: Product[]) => {
      // Store the products in localStorage when data is fetched
      if (data) {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(data));
      }
    },
    enabled
  });
}

export function useProduct(id: string | number): UseQueryResult<Product> {
  const queryKey = ['/api/products', id];
  
  const getInitialData = (): Product | undefined => {
    return getStoredProduct(id);
  };
  
  return useQuery<Product>({
    queryKey,
    queryFn: getQueryFn({ on401: "throw" }),
    initialData: getInitialData,
    onSuccess: (data: Product) => {
      // Store the product in localStorage when data is fetched
      if (data) {
        localStorage.setItem(`${LOCAL_STORAGE_PRODUCT_KEY_PREFIX}${id}`, JSON.stringify(data));
      }
    },
    enabled: !!id // Only run the query if id is provided
  });
}

export function useProductBySlug(slug: string): UseQueryResult<Product> {
  console.log(slug, "slug")
  const queryKey = [`/api/products/slug/${slug}`];
  
  return useQuery<Product>({
    queryKey,
    queryFn: getQueryFn({ on401: "throw" }),
    onSuccess: (data: Product) => {
      // Store the product in localStorage when data is fetched
      if (data && data._id) {
        localStorage.setItem(`${LOCAL_STORAGE_PRODUCT_KEY_PREFIX}${data._id}`, JSON.stringify(data));
      }
    },
    enabled: !!slug // Only run the query if slug is provided
  });
}