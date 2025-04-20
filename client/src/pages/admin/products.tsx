import React, { useState } from "react";
import { useAdminProducts } from "@/hooks/admin/use-admin-products";
import { useCategories } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/layout";
import {
  Dialog,
  DialogContent,
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
import { Loader2, Trash2, Plus, Edit, Tag, PackageOpen } from "lucide-react";
import { insertProductSchema, insertProductVariantSchema } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  // Add any extra validation here
});

type ProductFormValues = z.infer<typeof productFormSchema>;
type VariantFormValues = z.infer<typeof variantFormSchema>;

export default function AdminProductsPage() {
  const { toast } = useToast();
  const { products, isLoadingProducts, createProductMutation, updateProductMutation, deleteProductMutation } = useAdminProducts();
  const { categories } = useCategories();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [featureInput, setFeatureInput] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

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
      ageGroup: "",
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
      brand: "",
      ageGroup: "",
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

      await createProductMutation.mutateAsync(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  // Handle opening edit dialog
  const handleOpenEditDialog = (product: any) => {
    setCurrentProduct(product);
    
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
      brand: product.brand || "",
      ageGroup: product.ageGroup || "",
      stock: product.stock || 0,
      isActive: product.isActive !== false, // Default to true
      hasVariants: product.hasVariants || false,
      variantType: product.variantType || "none",
      variants: product.variants || [],
    });
    
    setIsEditDialogOpen(true);
  };

  // Handle product update
  const onUpdateProduct = async (data: ProductFormValues) => {
    if (!currentProduct) return;
    
    try {
      await updateProductMutation.mutateAsync({
        id: currentProduct._id,
        data,
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
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
                            defaultValue={field.value}
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
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
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
                            defaultValue={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select age group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Not specified</SelectItem>
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
                            defaultValue={field.value}
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
                            After creating the product, you can add specific variants
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
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
                                <SelectItem value="">Not specified</SelectItem>
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
                            onClick={() => {
                              // Will be implemented with a separate dialog for adding variants
                              toast({
                                title: "Coming Soon",
                                description: "Variant management will be available soon",
                              });
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add Variant
                          </Button>
                        </div>

                        {(currentProduct.variants?.length ?? 0) > 0 ? (
                          <div className="border rounded-md divide-y">
                            {currentProduct.variants.map((variant: any) => (
                              <div
                                key={variant._id}
                                className="p-4 flex items-center justify-between"
                              >
                                <div>
                                  <h4 className="font-medium">{variant.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    SKU: {variant.sku} | Price: ₹{variant.price.toFixed(2)}{" "}
                                    | Stock: {variant.stock}
                                  </p>
                                  {variant.isDefault && (
                                    <Badge variant="outline" className="mt-1">
                                      Default
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon">
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

                        <div className="pt-4">
                          <FormDescription>
                            After updating the basic product information, you can add, edit, or
                            remove variants in a future update.
                          </FormDescription>
                        </div>
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
    </AdminLayout>
  );
}