import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo: string;
  bannerImage?: string;
  featured: boolean;
  discount?: {
    type: string;
    value: number;
    label?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useAdminBrands(page = 1, limit = 100) {
  const {
    data: brandsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/admin/brands", page, limit],
    queryFn: () => 
      apiRequest("GET", `/api/admin/brands?page=${page}&limit=${limit}`)
        .then(res => res.json()),
  });

  const brands = brandsData?.brands || [];
  const totalBrands = brandsData?.total || 0;
  const totalPages = brandsData?.totalPages || 1;

  const createBrandMutation = useMutation({
    mutationFn: (brandData: Omit<Brand, "_id" | "createdAt" | "updatedAt">) => 
      apiRequest("POST", "/api/admin/brands", brandData)
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brands"] });
      toast({
        title: "Brand created",
        description: "Brand has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create brand",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBrandMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Brand> }) => 
      apiRequest("PUT", `/api/admin/brands/${id}`, data)
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brands"] });
      toast({
        title: "Brand updated",
        description: "Brand has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update brand",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest("DELETE", `/api/admin/brands/${id}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to delete brand");
          return true;
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brands"] });
      toast({
        title: "Brand deleted",
        description: "Brand has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete brand",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    brands,
    totalBrands,
    totalPages,
    isLoading,
    error,
    createBrand: createBrandMutation.mutate,
    updateBrand: updateBrandMutation.mutate,
    deleteBrand: deleteBrandMutation.mutate,
    isCreating: createBrandMutation.isPending,
    isUpdating: updateBrandMutation.isPending,
    isDeleting: deleteBrandMutation.isPending,
  };
}