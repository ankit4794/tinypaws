import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, 
  Search, 
  Pencil, 
  Trash, 
  PlusCircle, 
  ChevronRight,
  ChevronDown,
  FolderTree
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/admin/layout";

// Schema for category form
const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  parentId: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
  type: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoriesManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ["/api/admin/categories"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/categories");
      return await res.json();
    },
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const res = await apiRequest("POST", "/api/admin/categories", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category added successfully",
      });
      setIsAddDialogOpen(false);
      // Invalidate both admin categories and frontend categories
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add category",
        variant: "destructive",
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues & { _id: string }) => {
      const { _id, ...rest } = data;
      const res = await apiRequest("PATCH", `/api/admin/categories/${_id}`, rest);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      setSelectedCategory(null);
      setIsEditMode(false);
      // Invalidate both admin categories and frontend categories
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/categories/${id}`);
      // Our API returns 204 No Content for successful deletion
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      // Invalidate both admin categories and frontend categories
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  // Form for adding/editing a category
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      parentId: "",
      description: "",
      image: "",
      isActive: true,
      type: "",
    },
  });

  // Reset form and set default values when opening add dialog
  const openAddDialog = () => {
    form.reset({
      name: "",
      slug: "",
      parentId: "none",
      description: "",
      image: "",
      isActive: true,
      type: "none",
    });
    setIsAddDialogOpen(true);
    setIsEditMode(false);
  };

  // Set form values when editing a category
  const openEditDialog = (category) => {
    form.reset({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId || "none",
      description: category.description || "",
      image: category.image || "",
      isActive: category.isActive,
      type: category.type || "none",
    });
    setSelectedCategory(category);
    setIsEditMode(true);
  };

  // Handle form submission
  const onSubmit = (data: CategoryFormValues) => {
    // Convert "none" to empty string/null for parentId and type
    const processedData = {
      ...data,
      parentId: data.parentId === "none" ? "" : data.parentId,
      type: data.type === "none" ? "" : data.type
    };
    
    if (isEditMode && selectedCategory) {
      updateCategoryMutation.mutate({
        _id: selectedCategory._id,
        ...processedData,
      });
    } else {
      addCategoryMutation.mutate(processedData);
    }
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Auto-generate slug when name changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name") {
        form.setValue("slug", generateSlug(value.name || ""));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle delete confirmation
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this category? This will also delete any subcategories.")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  // Toggle expanded/collapsed state of a category
  const toggleCategoryExpanded = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Get parent categories (top-level categories with no parent)
  const parentCategories = categories 
    ? categories.filter(c => !c.parentId)
    : [];

  // Get subcategories for a given parent
  const getSubcategories = (parentId: string) => {
    return categories 
      ? categories.filter(c => c.parentId === parentId)
      : [];
  };

  // Filter categories based on search query
  const filteredCategories = !searchQuery 
    ? parentCategories
    : categories?.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) || [];

  // Should we use hierarchical view or flat view?
  const useHierarchicalView = searchQuery === "";

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">Categories Management</CardTitle>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by category name or description..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subcategories</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {useHierarchicalView ? (
                    // Hierarchical view - shows parent categories first, with expandable subcategories
                    parentCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No categories found
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {parentCategories.map((category) => {
                          const isExpanded = expandedCategories.includes(category._id);
                          const subcategories = getSubcategories(category._id);
                          return (
                            <>
                              <TableRow key={category._id} className="hover:bg-accent/50">
                                <TableCell className="font-medium">
                                  <div className="flex items-center">
                                    {subcategories.length > 0 ? (
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 mr-2 p-0"
                                        onClick={() => toggleCategoryExpanded(category._id)}
                                      >
                                        {isExpanded ? (
                                          <ChevronDown className="h-4 w-4" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4" />
                                        )}
                                      </Button>
                                    ) : (
                                      <span className="w-6 mr-2" />
                                    )}
                                    {category.name}
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                  {category.description || "—"}
                                </TableCell>
                                <TableCell>
                                  {category.type ? (
                                    <Badge variant="outline">{category.type}</Badge>
                                  ) : "—"}
                                </TableCell>
                                <TableCell>
                                  {subcategories.length} {subcategories.length === 1 ? 'subcategory' : 'subcategories'}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Switch
                                      checked={category.isActive}
                                      onCheckedChange={(checked) => {
                                        updateCategoryMutation.mutate({
                                          _id: category._id,
                                          ...category,
                                          isActive: checked
                                        });
                                      }}
                                    />
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => openEditDialog(category)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleDelete(category._id)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>

                              {/* Subcategories (if expanded) */}
                              {isExpanded && subcategories.map(subcat => (
                                <TableRow key={subcat._id} className="bg-muted/30">
                                  <TableCell className="font-medium">
                                    <div className="flex items-center pl-8">
                                      <FolderTree className="h-4 w-4 mr-2 text-muted-foreground" />
                                      {subcat.name}
                                    </div>
                                  </TableCell>
                                  <TableCell className="max-w-xs truncate">
                                    {subcat.description || "—"}
                                  </TableCell>
                                  <TableCell>
                                    {subcat.type ? (
                                      <Badge variant="outline">{subcat.type}</Badge>
                                    ) : "—"}
                                  </TableCell>
                                  <TableCell>—</TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <Switch
                                        checked={subcat.isActive}
                                        onCheckedChange={(checked) => {
                                          updateCategoryMutation.mutate({
                                            _id: subcat._id,
                                            ...subcat,
                                            isActive: checked
                                          });
                                        }}
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => openEditDialog(subcat)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleDelete(subcat._id)}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </>
                          );
                        })}
                      </>
                    )
                  ) : (
                    // Flat view - results from search
                    filteredCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No matching categories found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCategories.map((category) => {
                        const parentCategory = category.parentId 
                          ? categories?.find(c => c._id === category.parentId)
                          : null;
                        
                        return (
                          <TableRow key={category._id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{category.name}</span>
                                {parentCategory && (
                                  <span className="text-xs text-muted-foreground">
                                    Parent: {parentCategory.name}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {category.description || "—"}
                            </TableCell>
                            <TableCell>
                              {category.type ? (
                                <Badge variant="outline">{category.type}</Badge>
                              ) : "—"}
                            </TableCell>
                            <TableCell>
                              {category.parentId ? "—" : `${getSubcategories(category._id).length}`}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Switch
                                  checked={category.isActive}
                                  onCheckedChange={(checked) => {
                                    updateCategoryMutation.mutate({
                                      _id: category._id,
                                      ...category,
                                      isActive: checked
                                    });
                                  }}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openEditDialog(category)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDelete(category._id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog 
        open={isAddDialogOpen || isEditMode} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setSelectedCategory(null);
            setIsEditMode(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the category details." 
                : "Add a new category or subcategory."
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter category name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="category-slug"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="None (Top-level category)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (Top-level category)</SelectItem>
                        {parentCategories?.map((parent) => (
                          <SelectItem key={parent._id} value={parent._id}>
                            {parent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="fish">Fish</SelectItem>
                        <SelectItem value="small-pet">Small Pet</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter category description (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter image URL (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setSelectedCategory(null);
                    setIsEditMode(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addCategoryMutation.isPending || updateCategoryMutation.isPending}
                >
                  {(addCategoryMutation.isPending || updateCategoryMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    isEditMode ? "Update Category" : "Add Category"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
    </AdminLayout>
  );
}