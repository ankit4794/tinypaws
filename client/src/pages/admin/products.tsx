import React, { useState, useRef, useCallback } from "react";
import { useAdminProducts } from "@/hooks/admin/use-admin-products";
import { useCategories } from "@/hooks/use-categories";
import { useAdminBrands } from "@/hooks/admin/use-admin-brands";
import { 
  Image as ImageIcon, 
  X, 
  UploadCloud, 
  Check, 
  Edit, 
  Trash2, 
  Plus, 
  Tag,
  PackageOpen,
  Loader2,
  Scale,
  Package,
  DollarSign,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProductSchema, insertProductVariantSchema } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AdminLayout from "@/components/layout/AdminLayout";

// Extend the product schema for form validation
const productFormSchema = insertProductSchema
  .extend({
    // Convert category to string
    category: z.string().min(1, "Category is required"),
    // Make images optional initially (will be handled through upload)
    images: z.array(z.string()).optional().default([]),
    // Make features optional with cleaner handling
    features: z.array(z.string()).optional().default([]),
  })
  .omit({ rating: true, reviewCount: true }); // These are computed values, not form fields

// Extend the variant schema for form validation
const variantFormSchema = insertProductVariantSchema.extend({
  // Enhance form validation
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.number().min(0, "Price must be a positive number"),
  stock: z.number().min(0, "Stock must be a non-negative number"),
  
  // Conditionally optional fields depending on variant type
  weight: z.number().nullable(),
  weightUnit: z.enum(["g", "kg"]).nullable(),
  packSize: z.number().nullable(),
  
  // This will be validated conditionally in form submission
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productFormSchema>;
type VariantFormValues = z.infer<typeof variantFormSchema>;

export default function AdminProductsPage() {
  const { toast } = useToast();
  const { 
    products, 
    isLoadingProducts, 
    createProductMutation, 
    updateProductMutation, 
    deleteProductMutation,
    addVariantMutation,
    updateVariantMutation,
    deleteVariantMutation
  } = useAdminProducts();
  const { categories, isLoading: isLoadingCategories } = useCategories();
  const { brands, isLoading: isLoadingBrands } = useAdminBrands();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [featureInput, setFeatureInput] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [defaultImageIndex, setDefaultImageIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Variant Management
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [isEditingVariant, setIsEditingVariant] = useState(false);
  const [currentVariant, setCurrentVariant] = useState<any>(null);
  
  // Variant Form
  const variantForm = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      price: 0,
      originalPrice: null,
      stock: 0,
      weight: null,
      weightUnit: null,
      packSize: null,
      isDefault: false,
      isActive: true,
    },
  });

  // Product Form
  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      longDescription: "",
      price: 0,
      originalPrice: null,
      images: [],
      features: [],
      category: "",
      brand: "",
      ageGroup: "none",
      stock: 0,
      isActive: true,
      hasVariants: false,
      variantType: "none",
      variants: [],
    },
  });

  // Reset form and open create dialog
  const handleOpenCreateDialog = () => {
    productForm.reset({
      name: "",
      slug: "",
      description: "",
      longDescription: "",
      price: 0,
      originalPrice: null,
      images: [],
      features: [],
      category: "",
      brand: "no-brand", // Use "no-brand" instead of empty string
      ageGroup: "none",
      stock: 0,
      isActive: true,
      hasVariants: false,
      variantType: "none",
      variants: [],
    });
    setIsCreateDialogOpen(true);
  };

  // Handle product creation
  const onCreateProduct = async (data: ProductFormValues) => {
    try {
      // If slug is empty, generate from name
      if (!data.slug) {
        data.slug = data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      // Temporary fix for images - in a real app, would be handled by image uploads
      if (!data.images || data.images.length === 0) {
        data.images = [
          "https://storage.googleapis.com/tinypaws-bucket/placeholder-product.png",
        ];
      }
      
      // Process "no-brand" value to null for the backend to avoid ObjectId casting issues
      if (data.brand === "no-brand" || data.brand === "") {
        data.brand = null as any; // Cast to any to satisfy TypeScript
      }

      await createProductMutation.mutateAsync(data);
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error creating product",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      });
    }
  };

  // Handle opening edit dialog
  const handleOpenEditDialog = (product: any) => {
    setCurrentProduct(product);
    
    // Convert empty/null brand to "no-brand" for the form
    const brandValue = !product.brand ? "no-brand" : product.brand;
    
    // Reset the product form with the product data
    productForm.reset({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      longDescription: product.longDescription || "",
      price: product.price,
      originalPrice: product.originalPrice || null,
      images: product.images || [],
      features: product.features || [],
      category: product.category?._id || product.category,
      brand: brandValue,
      ageGroup: product.ageGroup || "none",
      stock: product.stock || 0,
      isActive: product.isActive !== false, // Default to true
      hasVariants: product.hasVariants || false,
      variantType: product.variantType || "none",
      variants: product.variants || [],
    });
    
    // Set default image index to 0 (first image)
    setDefaultImageIndex(0);
    
    setIsEditDialogOpen(true);
  };

  // Handle product update
  const onUpdateProduct = async (data: ProductFormValues) => {
    if (!currentProduct) return;
    
    try {
      // Process "no-brand" value to null for the backend to avoid ObjectId casting issues
      if (data.brand === "no-brand" || data.brand === "") {
        data.brand = null as any; // Cast to any to satisfy TypeScript
      }
      
      await updateProductMutation.mutateAsync({
        id: currentProduct._id,
        data,
      });
      setIsEditDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error updating product",
        description: error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
      });
    }
  };

  // Handle product deletion confirmation
  const handleDeleteClick = (product: any) => {
    setCurrentProduct(product);
    setIsDeleteConfirmOpen(true);
  };

  // Handle product deletion
  const handleDeleteConfirm = async () => {
    if (!currentProduct) return;
    
    try {
      await deleteProductMutation.mutateAsync(currentProduct._id);
      setIsDeleteConfirmOpen(false);
      setCurrentProduct(null);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Handle adding a feature
  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    
    const currentFeatures = productForm.getValues("features") || [];
    productForm.setValue("features", [...currentFeatures, featureInput.trim()]);
    setFeatureInput("");
  };

  // Handle removing a feature
  const handleRemoveFeature = (index: number) => {
    const currentFeatures = productForm.getValues("features") || [];
    productForm.setValue(
      "features",
      currentFeatures.filter((_, i) => i !== index)
    );
  };

  // Generate slug from product name
  const generateSlug = () => {
    const name = productForm.getValues("name");
    if (!name) return;
    
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    productForm.setValue("slug", slug);
  };
  
  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      
      // Add all selected files to the form data
      Array.from(event.target.files).forEach((file) => {
        formData.append("images", file);
      });
      
      // Make API request to upload images
      const response = await fetch("/api/admin/upload/products", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload images");
      }
      
      const result = await response.json();
      
      // Our API returns { urls: [...] } for multiple images
      if (!result.urls || result.urls.length === 0) {
        throw new Error("No image URLs returned");
      }
      
      // Get existing images from form
      const existingImages = productForm.getValues("images") || [];
      
      // Add the new image URLs to the form
      const updatedImages = [...existingImages, ...result.urls];
      productForm.setValue("images", updatedImages);
      
      // Set first image as default if no images existed before
      if (existingImages.length === 0) {
        setDefaultImageIndex(0);
      }
      
      toast({
        title: "Images uploaded",
        description: `Successfully uploaded ${result.urls.length} image(s)`,
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  // Handle setting default image
  const setDefaultImage = (index: number) => {
    setDefaultImageIndex(index);
    
    // Rearrange images so the default is first
    const images = [...productForm.getValues("images")];
    const defaultImage = images[index];
    
    // Remove the image at the index
    images.splice(index, 1);
    // Add it to the front of the array
    images.unshift(defaultImage);
    
    // Update form
    productForm.setValue("images", images);
    setDefaultImageIndex(0); // After rearranging, default is at index 0
  };
  
  // Handle removing an image
  const removeImage = (index: number) => {
    const images = [...productForm.getValues("images")];
    
    // Don't allow removing the last image
    if (images.length <= 1) {
      toast({
        title: "Cannot remove image",
        description: "Products must have at least one image",
        variant: "destructive",
      });
      return;
    }
    
    // Remove the image at the index
    images.splice(index, 1);
    
    // Update form
    productForm.setValue("images", images);
    
    // Adjust default index if needed
    if (index === defaultImageIndex) {
      setDefaultImageIndex(0);
    } else if (index < defaultImageIndex) {
      setDefaultImageIndex(defaultImageIndex - 1);
    }
  };
  
  // Variant Management
  
  // Open variant dialog for adding a new variant
  const handleOpenAddVariantDialog = () => {
    if (!currentProduct) {
      toast({
        title: "Error",
        description: "Please save the product first before adding variants",
        variant: "destructive",
      });
      return;
    }
    
    // Reset variant form
    variantForm.reset({
      name: "",
      sku: `${currentProduct.sku || currentProduct.slug}-v${
        (currentProduct.variants?.length || 0) + 1
      }`,
      price: currentProduct.price || 0,
      originalPrice: currentProduct.originalPrice || null,
      stock: 0,
      weight: null,
      weightUnit: productForm.getValues("variantType") === "weight" ? "g" : null,
      packSize: productForm.getValues("variantType") === "pack" ? 1 : null,
      isDefault: false,
      isActive: true,
    });
    
    setCurrentVariant(null);
    setIsEditingVariant(false);
    setIsVariantDialogOpen(true);
  };
  
  // Open variant dialog for editing an existing variant
  const handleOpenEditVariantDialog = (variant: any) => {
    if (!currentProduct) return;
    
    setCurrentVariant(variant);
    
    // Reset variant form with the variant data
    variantForm.reset({
      name: variant.name || "",
      sku: variant.sku || "",
      price: variant.price || 0,
      originalPrice: variant.originalPrice || null,
      stock: variant.stock || 0,
      weight: variant.weight || null,
      weightUnit: variant.weightUnit || null,
      packSize: variant.packSize || null,
      isDefault: variant.isDefault || false,
      isActive: variant.isActive !== false, // Default to true
    });
    
    setIsEditingVariant(true);
    setIsVariantDialogOpen(true);
  };
  
  // Add a new variant
  const handleAddVariant = async (data: VariantFormValues) => {
    if (!currentProduct) return;
    
    // Additional validation based on the variant type
    try {
      const variantType = productForm.getValues("variantType");
      
      // For weight variants, weight and weightUnit are required
      if (variantType === "weight") {
        if (data.weight === null || data.weight === undefined) {
          throw new Error("Weight is required for weight-based variants");
        }
        if (!data.weightUnit) {
          throw new Error("Weight unit is required for weight-based variants");
        }
        // Clear pack size field
        data.packSize = null;
      }
      
      // For pack variants, packSize is required
      if (variantType === "pack") {
        if (data.packSize === null || data.packSize === undefined || data.packSize <= 0) {
          throw new Error("Pack size is required for pack-based variants");
        }
        // Clear weight fields
        data.weight = null;
        data.weightUnit = null;
      }
      
      // If this is set as the default variant, we need to update other variants
      if (data.isDefault) {
        // We'll handle this on the server side to ensure consistency
      }
      
      // Send the variant data to the server
      await addVariantMutation.mutateAsync({
        productId: currentProduct._id,
        variantData: data,
      });
      
      setIsVariantDialogOpen(false);
      
      // Update the current product's variant list in the form
      const updatedProduct = await fetch(`/api/admin/products/${currentProduct._id}`).then(res => res.json());
      if (updatedProduct) {
        productForm.setValue("variants", updatedProduct.variants || []);
        setCurrentProduct(updatedProduct);
      }
      
      toast({
        title: "Success",
        description: "Variant added successfully",
      });
    } catch (error) {
      console.error("Error adding variant:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add variant",
        variant: "destructive",
      });
    }
  };
  
  // Update an existing variant
  const handleUpdateVariant = async (data: VariantFormValues) => {
    if (!currentProduct || !currentVariant) return;
    
    // Additional validation based on the variant type
    try {
      const variantType = productForm.getValues("variantType");
      
      // For weight variants, weight and weightUnit are required
      if (variantType === "weight") {
        if (data.weight === null || data.weight === undefined) {
          throw new Error("Weight is required for weight-based variants");
        }
        if (!data.weightUnit) {
          throw new Error("Weight unit is required for weight-based variants");
        }
        // Clear pack size field
        data.packSize = null;
      }
      
      // For pack variants, packSize is required
      if (variantType === "pack") {
        if (data.packSize === null || data.packSize === undefined || data.packSize <= 0) {
          throw new Error("Pack size is required for pack-based variants");
        }
        // Clear weight fields
        data.weight = null;
        data.weightUnit = null;
      }
      
      // If this is set as the default variant, we need to update other variants
      if (data.isDefault) {
        // We'll handle this on the server side to ensure consistency
      }
      
      await updateVariantMutation.mutateAsync({
        productId: currentProduct._id,
        variantId: currentVariant._id,
        variantData: data,
      });
      
      setIsVariantDialogOpen(false);
      
      // Update the current product's variant list in the form
      const updatedProduct = await fetch(`/api/admin/products/${currentProduct._id}`).then(res => res.json());
      if (updatedProduct) {
        productForm.setValue("variants", updatedProduct.variants || []);
        setCurrentProduct(updatedProduct);
      }
      
      toast({
        title: "Success",
        description: "Variant updated successfully",
      });
    } catch (error) {
      console.error("Error updating variant:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update variant",
        variant: "destructive",
      });
    }
  };
  
  // Delete a variant
  const handleDeleteVariant = async (variantId: string) => {
    if (!currentProduct) return;
    
    try {
      await deleteVariantMutation.mutateAsync({
        productId: currentProduct._id,
        variantId,
      });
      
      // Update the current product's variant list in the form
      const updatedProduct = await fetch(`/api/admin/products/${currentProduct._id}`).then(res => res.json());
      if (updatedProduct) {
        productForm.setValue("variants", updatedProduct.variants || []);
        setCurrentProduct(updatedProduct);
      }
      
      toast({
        title: "Success",
        description: "Variant deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete variant",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Product Management</h1>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage your product catalog including variants
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products && products.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>List of all products</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Variants</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: any) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>
                          {product.category?.name || "Uncategorized"}
                        </TableCell>
                        <TableCell>
                          ₹{product.price.toFixed(2)}
                          {product.originalPrice && (
                            <span className="ml-2 text-sm line-through text-muted-foreground">
                              ₹{product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          {product.isActive ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.hasVariants ? (
                            <Badge variant="outline">
                              {product.variants?.length || 0}{" "}
                              {product.variantType === "weight"
                                ? "Weight Options"
                                : "Pack Options"}
                            </Badge>
                          ) : (
                            <Badge variant="outline">None</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                No products found. Click "Add Product" to create your first
                product.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
          </DialogHeader>
          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit(onCreateProduct)}>
              <Tabs defaultValue="basic" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={productForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name*</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-2 items-end">
                      <FormField
                        control={productForm.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Slug</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              URL-friendly product identifier
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mb-2"
                        onClick={generateSlug}
                      >
                        Generate
                      </Button>
                    </div>

                    <FormField
                      control={productForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingCategories ? (
                                <div className="flex items-center justify-center p-4">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Loading categories...
                                </div>
                              ) : categories && categories.length > 0 ? (
                                categories.map((category) => (
                                  <SelectItem key={category._id} value={category._id}>
                                    {category.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-center text-sm text-muted-foreground">
                                  No categories found
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={productForm.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="no-brand">No Brand</SelectItem>
                              {isLoadingBrands ? (
                                <div className="flex items-center justify-center p-4">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Loading brands...
                                </div>
                              ) : brands && brands.length > 0 ? (
                                brands.map((brand) => (
                                  <SelectItem key={brand._id} value={brand._id}>
                                    {brand.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-center text-sm text-muted-foreground">
                                  No brands found
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={productForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₹)*</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={productForm.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormDescription>
                            Original price for showing discounts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={productForm.control}
                      name="ageGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age Group</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || "none"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select age group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Not specified</SelectItem>
                              <SelectItem value="puppy">Puppy</SelectItem>
                              <SelectItem value="adult">Adult</SelectItem>
                              <SelectItem value="senior">Senior</SelectItem>
                              <SelectItem value="all">All Ages</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Images upload section */}
                    <div className="col-span-2">
                      <FormLabel className="block mb-2">Product Images</FormLabel>
                      <div className="space-y-4">
                        {/* File input for image upload */}
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            ref={fileInputRef}
                            className="hidden"
                            id="image-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex-1"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Upload Images
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {/* Image previews */}
                        <div className="grid grid-cols-4 gap-4">
                          {productForm.watch("images")?.map((image, index) => (
                            <div 
                              key={index} 
                              className={`relative group rounded-md overflow-hidden border ${
                                index === defaultImageIndex ? "ring-2 ring-primary" : ""
                              }`}
                            >
                              <img 
                                src={image} 
                                alt={`Product image ${index + 1}`} 
                                className="w-full h-24 object-cover"
                              />
                              
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                {index === defaultImageIndex ? (
                                  <Badge className="absolute top-2 left-2 bg-primary text-white">
                                    Default
                                  </Badge>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDefaultImage(index)}
                                    className="absolute top-1 left-1 text-white hover:text-primary"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 text-white hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Show a message if no images are uploaded */}
                        {(!productForm.watch("images") || productForm.watch("images").length === 0) && (
                          <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
                            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p>No images uploaded yet</p>
                            <p className="text-xs mt-1">
                              Upload at least one image for your product
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <FormField
                      control={productForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Product will be visible on the store
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Description Tab */}
                <TabsContent value="description" className="space-y-4 py-4">
                  <FormField
                    control={productForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Brief description shown in product lists"
                            className="min-h-[100px]"
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={productForm.control}
                    name="longDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Long Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Full product description shown on product page"
                            className="min-h-[200px]"
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Product Features</FormLabel>
                    <div className="flex space-x-2">
                      <Input
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        placeholder="Add a product feature"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleAddFeature}
                        variant="outline"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="mt-2">
                      {productForm.getValues("features")?.length > 0 ? (
                        <div className="space-y-2">
                          {productForm.getValues("features").map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 border rounded-md"
                            >
                              <span>{feature}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveFeature(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No features added yet
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory" className="space-y-4 py-4">
                  <FormField
                    control={productForm.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={productForm.control}
                    name="hasVariants"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Has Variants</FormLabel>
                          <FormDescription>
                            Product has multiple variants (like different weights or pack sizes)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {productForm.watch("hasVariants") && (
                    <>
                      <FormField
                        control={productForm.control}
                        name="variantType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Variant Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value || "weight"}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select variant type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="weight">
                                  <div className="flex items-center">
                                    <Scale className="h-4 w-4 mr-2" />
                                    <span>Weight Options (g/kg)</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="pack">
                                  <div className="flex items-center">
                                    <Package className="h-4 w-4 mr-2" />
                                    <span>Pack Sizes</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {isCreateDialogOpen
                                ? "After creating the product, you can add specific variants"
                                : "Select the type of variants for this product"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {!isCreateDialogOpen && (
                        <div className="border rounded-lg p-4 mt-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-base font-medium">
                              {productForm.watch("variantType") === "weight"
                                ? "Weight Options"
                                : "Pack Size Options"}
                            </h4>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleOpenAddVariantDialog}
                              size="sm"
                            >
                              <Plus className="h-4 w-4 mr-2" /> 
                              Add {productForm.watch("variantType") === "weight" ? "Weight" : "Pack"} Variant
                            </Button>
                          </div>
                          
                          {currentProduct?.variants?.length > 0 ? (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                              {currentProduct.variants.map((variant: any) => (
                                <div 
                                  key={variant._id} 
                                  className={`flex items-center justify-between p-3 border rounded-md ${
                                    variant.isDefault ? "border-primary bg-primary/5" : ""
                                  }`}
                                >
                                  <div className="flex flex-col">
                                    <div className="flex items-center">
                                      <span className="font-medium mr-2">{variant.name}</span>
                                      {variant.isDefault && (
                                        <Badge variant="outline" className="bg-primary/10">Default</Badge>
                                      )}
                                      {!variant.isActive && (
                                        <Badge variant="outline" className="bg-destructive/10 ml-2">Inactive</Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                                      <span className="flex items-center">
                                        <DollarSign className="h-3 w-3 mr-1" />
                                        ₹{variant.price.toFixed(2)}
                                        {variant.originalPrice && (
                                          <span className="ml-1 text-xs line-through">
                                            ₹{variant.originalPrice.toFixed(2)}
                                          </span>
                                        )}
                                      </span>
                                      
                                      {/* Show weight or pack size information */}
                                      {productForm.watch("variantType") === "weight" && variant.weight && variant.weightUnit && (
                                        <span className="flex items-center">
                                          <Scale className="h-3 w-3 mr-1" />
                                          {variant.weight} {variant.weightUnit}
                                        </span>
                                      )}
                                      
                                      {productForm.watch("variantType") === "pack" && variant.packSize && (
                                        <span className="flex items-center">
                                          <Package className="h-3 w-3 mr-1" />
                                          Pack of {variant.packSize}
                                        </span>
                                      )}
                                      
                                      <span className="flex items-center">
                                        <ShoppingBag className="h-3 w-3 mr-1" />
                                        Stock: {variant.stock}
                                      </span>
                                      
                                      <span className="text-xs">SKU: {variant.sku}</span>
                                    </div>
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleOpenEditVariantDialog(variant)}
                                      className="h-8 w-8"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteVariant(variant._id)}
                                      className="h-8 w-8 text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center p-4 text-muted-foreground border rounded-md">
                              No variants added yet. Click "Add Variant" to create your first variant.
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <div className="pt-4">
                    <FormDescription className="text-amber-600">
                      Note: Images upload functionality will be implemented separately. 
                      For now, a placeholder image will be used.
                    </FormDescription>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createProductMutation.isPending}
                >
                  {createProductMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Product
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {currentProduct && (
            <Form {...productForm}>
              <form onSubmit={productForm.handleSubmit(onUpdateProduct)}>
                <Tabs defaultValue="basic" className="mt-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="variants">Variants</TabsTrigger>
                  </TabsList>

                  {/* Basic Info Tab */}
                  <TabsContent value="basic" className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={productForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name*</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-2 items-end">
                        <FormField
                          control={productForm.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Slug</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                URL-friendly product identifier
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="mb-2"
                          onClick={generateSlug}
                        >
                          Generate
                        </Button>
                      </div>

                      <FormField
                        control={productForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category*</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category._id} value={category._id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a brand" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="no-brand">No Brand</SelectItem>
                                {isLoadingBrands ? (
                                  <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Loading brands...
                                  </div>
                                ) : brands && brands.length > 0 ? (
                                  brands.map((brand) => (
                                    <SelectItem key={brand._id} value={brand._id}>
                                      {brand.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="p-2 text-center text-sm text-muted-foreground">
                                    No brands found
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₹)*</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="originalPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Original Price (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              />
                            </FormControl>
                            <FormDescription>
                              Original price for showing discounts
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productForm.control}
                        name="ageGroup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age Group</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select age group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Not specified</SelectItem>
                                <SelectItem value="puppy">Puppy</SelectItem>
                                <SelectItem value="adult">Adult</SelectItem>
                                <SelectItem value="senior">Senior</SelectItem>
                                <SelectItem value="all">All Ages</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Images upload section */}
                      <div className="col-span-2">
                        <FormLabel className="block mb-2">Product Images</FormLabel>
                        <div className="space-y-4">
                          {/* File input for image upload */}
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              ref={fileInputRef}
                              className="hidden"
                              id="image-upload-edit"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="flex-1"
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <UploadCloud className="mr-2 h-4 w-4" />
                                  Upload Images
                                </>
                              )}
                            </Button>
                          </div>
                          
                          {/* Image previews */}
                          <div className="grid grid-cols-4 gap-4">
                            {productForm.watch("images")?.map((image, index) => (
                              <div 
                                key={index} 
                                className={`relative group rounded-md overflow-hidden border ${
                                  index === defaultImageIndex ? "ring-2 ring-primary" : ""
                                }`}
                              >
                                <img 
                                  src={image} 
                                  alt={`Product image ${index + 1}`} 
                                  className="w-full h-24 object-cover"
                                />
                                
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  {index === defaultImageIndex ? (
                                    <Badge className="absolute top-2 left-2 bg-primary text-white">
                                      Default
                                    </Badge>
                                  ) : (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setDefaultImage(index)}
                                      className="absolute top-1 left-1 text-white hover:text-primary"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 text-white hover:text-destructive"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Show a message if no images are uploaded */}
                          {(!productForm.watch("images") || productForm.watch("images").length === 0) && (
                            <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
                              <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p>No images uploaded yet</p>
                              <p className="text-xs mt-1">
                                Upload at least one image for your product
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <FormField
                        control={productForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Active</FormLabel>
                              <FormDescription>
                                Product will be visible on the store
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Description Tab */}
                  <TabsContent value="description" className="space-y-4 py-4">
                    <FormField
                      control={productForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Brief description shown in product lists"
                              className="min-h-[100px]"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={productForm.control}
                      name="longDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Long Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Full product description shown on product page"
                              className="min-h-[200px]"
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormLabel>Product Features</FormLabel>
                      <div className="flex space-x-2">
                        <Input
                          value={featureInput}
                          onChange={(e) => setFeatureInput(e.target.value)}
                          placeholder="Add a product feature"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={handleAddFeature}
                          variant="outline"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="mt-2">
                        {productForm.getValues("features")?.length > 0 ? (
                          <div className="space-y-2">
                            {productForm.getValues("features").map((feature, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 border rounded-md"
                              >
                                <span>{feature}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveFeature(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No features added yet
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Inventory Tab */}
                  <TabsContent value="inventory" className="space-y-4 py-4">
                    <FormField
                      control={productForm.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity*</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={productForm.control}
                      name="hasVariants"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Has Variants</FormLabel>
                            <FormDescription>
                              Product has multiple variants (like different weights or pack sizes)
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {productForm.watch("hasVariants") && (
                      <FormField
                        control={productForm.control}
                        name="variantType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Variant Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select variant type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="weight">
                                  <div className="flex items-center">
                                    <Tag className="h-4 w-4 mr-2" />
                                    <span>Weight Options (g/kg)</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="pack">
                                  <div className="flex items-center">
                                    <PackageOpen className="h-4 w-4 mr-2" />
                                    <span>Pack Sizes</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Manage variants in the Variants tab
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="pt-4">
                      <FormDescription className="text-amber-600">
                        Note: Images upload functionality will be implemented separately. 
                        For now, use placeholder images.
                      </FormDescription>
                    </div>
                  </TabsContent>

                  {/* Variants Tab */}
                  <TabsContent value="variants" className="space-y-4 py-4">
                    {productForm.watch("hasVariants") ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">
                            {productForm.watch("variantType") === "weight"
                              ? "Weight Options"
                              : "Pack Size Options"}
                          </h3>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleOpenAddVariantDialog}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add Variant
                          </Button>
                        </div>

                        {(currentProduct.variants?.length ?? 0) > 0 ? (
                          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {currentProduct.variants.map((variant: any) => (
                              <div 
                                key={variant._id} 
                                className={`flex items-center justify-between p-3 border rounded-md ${
                                  variant.isDefault ? "border-primary bg-primary/5" : ""
                                }`}
                              >
                                <div className="flex flex-col">
                                  <div className="flex items-center">
                                    <span className="font-medium mr-2">{variant.name}</span>
                                    {variant.isDefault && (
                                      <Badge variant="outline" className="bg-primary/10">Default</Badge>
                                    )}
                                    {!variant.isActive && (
                                      <Badge variant="outline" className="bg-destructive/10 ml-2">Inactive</Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                                    <span className="flex items-center">
                                      <DollarSign className="h-3 w-3 mr-1" />
                                      ₹{variant.price.toFixed(2)}
                                    </span>
                                    <span className="flex items-center">
                                      <ShoppingBag className="h-3 w-3 mr-1" />
                                      Stock: {variant.stock}
                                    </span>
                                    {variant.weight && (
                                      <span>
                                        {variant.weight}{variant.weightUnit}
                                      </span>
                                    )}
                                    {variant.packSize && (
                                      <span>
                                        Pack of {variant.packSize}
                                      </span>
                                    )}
                                    <span className="text-xs">SKU: {variant.sku}</span>
                                  </div>
                                </div>
                                <div className="flex space-x-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenEditVariantDialog(variant)}
                                    className="h-8 w-8"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteVariant(variant._id)}
                                    className="h-8 w-8 text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-8 border rounded-md text-muted-foreground">
                            No variants added yet. Click "Add Variant" to create your first variant.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center p-8 border rounded-md">
                        <h3 className="text-lg font-medium mb-2">Variants Not Enabled</h3>
                        <p className="text-muted-foreground mb-4">
                          Enable the "Has Variants" option in the Inventory tab to manage product variants.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            productForm.setValue("hasVariants", true);
                            productForm.setValue("variantType", "weight");
                          }}
                        >
                          Enable Variants
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProductMutation.isPending}
                  >
                    {updateProductMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Product
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2">
              Are you sure you want to delete{" "}
              <span className="font-medium">{currentProduct?.name}</span>?
            </p>
            <p className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the product
              and all associated data, including variants, reviews, and order history.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Variant Dialog */}
      <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditingVariant ? "Edit Variant" : "Add Variant"}
            </DialogTitle>
            <DialogDescription>
              {productForm.watch("variantType") === "weight"
                ? "Create a weight-based variant option"
                : "Create a pack size variant option"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...variantForm}>
            <form 
              onSubmit={variantForm.handleSubmit(
                isEditingVariant ? handleUpdateVariant : handleAddVariant
              )}
              className="space-y-4 py-2"
            >
              <FormField
                control={variantForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant Name*</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={
                        productForm.watch("variantType") === "weight"
                          ? "e.g. Small (200g), Medium (500g)"
                          : "e.g. Single Pack, Pack of 3"
                      } />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={variantForm.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Unique SKU for this variant" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={variantForm.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={variantForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={variantForm.control}
                  name="originalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price (₹)</FormLabel>
                      <FormDescription>If on sale, show strikethrough</FormDescription>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value !== '' 
                              ? parseFloat(e.target.value) 
                              : null;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Weight-specific fields */}
              {productForm.watch("variantType") === "weight" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={variantForm.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight*</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value !== '' 
                                ? parseFloat(e.target.value) 
                                : null;
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={variantForm.control}
                    name="weightUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight Unit*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "g"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="g">
                              <div className="flex items-center">
                                <span>Grams (g)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="kg">
                              <div className="flex items-center">
                                <span>Kilograms (kg)</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {/* Pack-specific fields */}
              {productForm.watch("variantType") === "pack" && (
                <FormField
                  control={variantForm.control}
                  name="packSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pack Size*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value !== '' 
                              ? parseInt(e.target.value) 
                              : null;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>Number of items in this pack</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={variantForm.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Default Variant</FormLabel>
                        <FormDescription>
                          Selected by default on product page
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={variantForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Show this variant on the store
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVariantDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isEditingVariant 
                      ? updateVariantMutation.isPending 
                      : addVariantMutation.isPending
                  }
                >
                  {(isEditingVariant ? updateVariantMutation.isPending : addVariantMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditingVariant ? "Update" : "Add"} Variant
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
