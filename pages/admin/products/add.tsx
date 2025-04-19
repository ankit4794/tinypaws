import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/use-auth';
import { X, Plus, ArrowLeft, Save, Upload } from 'lucide-react';

// Define the product schema for validation
const productSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters" }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters" }),
  sku: z.string().optional(),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  longDescription: z.string().optional(),
  price: z.coerce.number().positive({ message: "Price must be positive" }),
  originalPrice: z.coerce.number().optional(),
  stock: z.coerce.number().int().nonnegative({ message: "Stock must be 0 or positive" }),
  categoryId: z.string().min(1, { message: "Please select a category" }),
  images: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  specifications: z.array(z.object({
    name: z.string().min(1, { message: "Specification name is required" }),
    value: z.string().min(1, { message: "Specification value is required" })
  })).optional(),
  features: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AddProduct() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);

  // Initialize form with default values
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      sku: '',
      description: '',
      longDescription: '',
      price: 0,
      originalPrice: 0,
      stock: 0,
      categoryId: '',
      images: [],
      isFeatured: false,
      specifications: [{ name: '', value: '' }],
      features: [''],
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    }
  });

  // Admin check
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/admin/login');
    }
  }, [user, isLoading, router]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive"
        });
      }
    };

    if (user && user.role === 'ADMIN') {
      fetchCategories();
    }
  }, [user, toast]);

  // Auto-generate slug from product name
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    form.setValue('slug', slug);
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', files[0]);
    
    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        const newImageUrls = [...imageUrls, data.url];
        setImageUrls(newImageUrls);
        form.setValue('images', newImageUrls);
        toast({
          title: "Success",
          description: "Image uploaded successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove an image from the list
  const removeImage = (index) => {
    const newImageUrls = [...imageUrls];
    newImageUrls.splice(index, 1);
    setImageUrls(newImageUrls);
    form.setValue('images', newImageUrls);
  };

  // Add a specification field
  const addSpecification = () => {
    const currentSpecs = form.getValues('specifications') || [];
    form.setValue('specifications', [...currentSpecs, { name: '', value: '' }]);
  };

  // Remove a specification field
  const removeSpecification = (index) => {
    const currentSpecs = form.getValues('specifications') || [];
    if (currentSpecs.length <= 1) return;
    
    const newSpecs = [...currentSpecs];
    newSpecs.splice(index, 1);
    form.setValue('specifications', newSpecs);
  };

  // Add a feature field
  const addFeature = () => {
    const currentFeatures = form.getValues('features') || [];
    form.setValue('features', [...currentFeatures, '']);
  };

  // Remove a feature field
  const removeFeature = (index) => {
    const currentFeatures = form.getValues('features') || [];
    if (currentFeatures.length <= 1) return;
    
    const newFeatures = [...currentFeatures];
    newFeatures.splice(index, 1);
    form.setValue('features', newFeatures);
  };

  // Form submission handler
  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Product created successfully"
        });
        router.push('/admin/products');
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to create product",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/admin/products')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            <h1 className="text-3xl font-bold">Add New Product</h1>
          </div>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </Button>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="details">Details & Features</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Information</CardTitle>
                    <CardDescription>Enter the basic information about the product</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name*</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter product name" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleNameChange(e);
                                }}
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
                            <FormLabel>Slug*</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="product-slug" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              URL-friendly version of the product name
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (₹)*</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0.00" 
                                step="0.01"
                                min="0"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="originalPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Original Price (₹)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0.00" 
                                step="0.01"
                                min="0"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Original price (if on sale)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock*</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                min="0"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="categoryId"
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
                                  <SelectItem 
                                    key={category.id} 
                                    value={category.id}
                                  >
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
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="SKU or product code" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description*</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter product short description" 
                              className="h-20"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="longDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Long Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter detailed product description" 
                              className="h-40"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Detailed product description (supports markdown)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="w-4 h-4"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Feature this product on the homepage
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="images" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                    <CardDescription>Upload images for this product</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative rounded-md overflow-hidden h-40 bg-gray-100">
                          <img 
                            src={url} 
                            alt={`Product image ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <div className="border-2 border-dashed border-gray-300 rounded-md h-40 flex flex-col items-center justify-center p-4 hover:border-gray-400 cursor-pointer">
                        <input
                          type="file"
                          id="image-upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                          <Upload className="h-10 w-10 mb-2 text-gray-400" />
                          <span className="text-sm text-gray-500 text-center">
                            {uploadingImage ? 'Uploading...' : 'Click to upload an image'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Specifications</CardTitle>
                    <CardDescription>Add product specifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {form.watch('specifications')?.map((_, index) => (
                      <div key={index} className="flex gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name={`specifications.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel className={index !== 0 ? 'sr-only' : ''}>
                                {index === 0 ? 'Specification Name' : ''}
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. Material" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`specifications.${index}.value`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel className={index !== 0 ? 'sr-only' : ''}>
                                {index === 0 ? 'Value' : ''}
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. Cotton" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className={`flex items-end ${index !== 0 ? 'mb-[2px]' : 'mb-[22px]'}`}>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeSpecification(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSpecification}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Specification
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Features</CardTitle>
                    <CardDescription>Highlight the main features of the product</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {form.watch('features')?.map((_, index) => (
                      <div key={index} className="flex gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name={`features.${index}`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel className={index !== 0 ? 'sr-only' : ''}>
                                {index === 0 ? 'Feature' : ''}
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. Hypoallergenic material" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className={`flex items-end ${index !== 0 ? 'mb-[2px]' : 'mb-[22px]'}`}>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeFeature(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addFeature}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feature
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="seo" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Information</CardTitle>
                    <CardDescription>Optimize for search engines</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter SEO title" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            If left empty, the product name will be used
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter SEO description" 
                              className="h-24"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metaKeywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Keywords</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. pet food, dog treats, natural" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Separate keywords with commas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin/products')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </div>
    </AdminLayout>
  );
}