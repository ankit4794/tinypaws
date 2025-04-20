import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Product, ProductVariantDocument } from "@shared/schema";

export function useAdminProducts() {
  const { toast } = useToast();
  
  // Get all products (admin view)
  const {
    data,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery<{ products: Product[], pagination: any }>({
    queryKey: ['/api/admin/products'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/products');
      return await res.json();
    },
  });
  
  // Extract products from the paginated response
  const products = data?.products || [];
  
  // Get a single product by ID
  const getProduct = (id: string) => {
    return useQuery({
      queryKey: ['/api/admin/products', id],
      queryFn: async () => {
        const res = await apiRequest('GET', `/api/admin/products/${id}`);
        return await res.json();
      },
      enabled: !!id, // Only run if ID is provided
    });
  };
  
  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const res = await apiRequest('POST', '/api/admin/products', productData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create product: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PUT', `/api/admin/products/${id}`, data);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products', variables.id] });
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update product: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete product: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Add product variant mutation
  const addVariantMutation = useMutation({
    mutationFn: async ({ productId, variantData }: { productId: string; variantData: any }) => {
      const res = await apiRequest('POST', `/api/admin/products/${productId}/variants`, variantData);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products', variables.productId] });
      toast({
        title: 'Success',
        description: 'Product variant added successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to add variant: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Update product variant mutation
  const updateVariantMutation = useMutation({
    mutationFn: async ({ 
      productId, 
      variantId, 
      variantData 
    }: { 
      productId: string; 
      variantId: string; 
      variantData: any 
    }) => {
      const res = await apiRequest(
        'PUT', 
        `/api/admin/products/${productId}/variants/${variantId}`, 
        variantData
      );
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products', variables.productId] });
      toast({
        title: 'Success',
        description: 'Product variant updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update variant: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Delete product variant mutation
  const deleteVariantMutation = useMutation({
    mutationFn: async ({ productId, variantId }: { productId: string; variantId: string }) => {
      await apiRequest('DELETE', `/api/admin/products/${productId}/variants/${variantId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products', variables.productId] });
      toast({
        title: 'Success',
        description: 'Product variant deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete variant: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  return {
    products,
    isLoadingProducts,
    productsError,
    getProduct,
    createProductMutation,
    updateProductMutation,
    deleteProductMutation,
    addVariantMutation,
    updateVariantMutation,
    deleteVariantMutation,
  };
}