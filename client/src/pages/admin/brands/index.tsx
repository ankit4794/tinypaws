import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus, X, Check, ImagePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AdminLayout from '@/components/admin/AdminLayout';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

type Brand = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo: string;
  bannerImage?: string;
  featured: boolean;
  discount?: {
    type: 'flat' | 'percentage' | 'none';
    value: number;
    label?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type BrandFormData = {
  name: string;
  slug?: string;
  description?: string;
  featured: boolean;
  isActive: boolean;
  discount: {
    type: 'flat' | 'percentage' | 'none';
    value: number;
    label?: string;
  };
};

export default function AdminBrandsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    description: '',
    featured: false,
    isActive: true,
    discount: {
      type: 'none',
      value: 0,
      label: '',
    },
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch brands
  const { data: brands, isLoading, error } = useQuery({
    queryKey: ['/api/admin/brands'],
    queryFn: async () => {
      const response = await fetch('/api/admin/brands');
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      return response.json();
    },
  });

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/admin/brands', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to create brand');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/brands'] });
      toast({
        title: 'Brand created',
        description: 'The brand has been created successfully.',
      });
      resetForm();
      setIsModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update brand mutation
  const updateBrandMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const response = await fetch(`/api/admin/brands/${id}`, {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to update brand');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/brands'] });
      toast({
        title: 'Brand updated',
        description: 'The brand has been updated successfully.',
      });
      resetForm();
      setIsModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete brand mutation
  const deleteBrandMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/brands/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/brands'] });
      toast({
        title: 'Brand deleted',
        description: 'The brand has been deleted successfully.',
      });
      setDeleteConfirmationId(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('discount.')) {
      const discountField = name.split('.')[1];
      setFormData({
        ...formData,
        discount: {
          ...formData.discount,
          [discountField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      featured: false,
      isActive: true,
      discount: {
        type: 'none',
        value: 0,
        label: '',
      },
    });
    setLogoFile(null);
    setBannerFile(null);
    setLogoPreview(null);
    setBannerPreview(null);
    setEditingBrand(null);
    setIsSubmitting(false);
  };

  const handleEditClick = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || '',
      featured: brand.featured,
      isActive: brand.isActive,
      discount: brand.discount || {
        type: 'none',
        value: 0,
        label: '',
      },
    });
    setLogoPreview(brand.logo);
    setBannerPreview(brand.bannerImage || null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmationId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmationId) {
      deleteBrandMutation.mutate(deleteConfirmationId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Add brand data as JSON
      formDataToSend.append('data', JSON.stringify(formData));
      
      // Add files if selected
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }
      
      if (bannerFile) {
        formDataToSend.append('bannerImage', bannerFile);
      }
      
      if (editingBrand) {
        await updateBrandMutation.mutateAsync({ id: editingBrand._id, formData: formDataToSend });
      } else {
        await createBrandMutation.mutateAsync(formDataToSend);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Brand Management</h1>
          <Button onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Brand
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center text-red-500">
                <p>Failed to load brands. Please try again.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableCaption>List of all brands ({brands?.length || 0})</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands && brands.length > 0 ? (
                  brands.map((brand: Brand) => (
                    <TableRow key={brand._id}>
                      <TableCell>
                        {brand.logo && (
                          <img 
                            src={brand.logo} 
                            alt={brand.name} 
                            className="w-10 h-10 object-contain"
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell>{brand.slug}</TableCell>
                      <TableCell>
                        {brand.featured ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Featured
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Regular
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {brand.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditClick(brand)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteClick(brand._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No brands found. Click "Add Brand" to create your first brand.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Brand Form Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
              <DialogDescription>
                {editingBrand ? 'Update the brand details below.' : 'Fill in the brand details below to create a new brand.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="logo" className="block">Brand Logo</Label>
                    <div className="flex items-center space-x-4">
                      {logoPreview && (
                        <div className="relative">
                          <img 
                            src={logoPreview} 
                            alt="Logo Preview" 
                            className="w-20 h-20 object-contain border rounded-md"
                          />
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
                            onClick={() => {
                              setLogoFile(null);
                              setLogoPreview(null);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      <div className="flex-1">
                        <Label 
                          htmlFor="logo-upload" 
                          className="cursor-pointer flex items-center justify-center w-full h-10 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <ImagePlus className="mr-2 h-4 w-4" />
                          {logoPreview ? 'Change Logo' : 'Upload Logo'}
                        </Label>
                        <input
                          id="logo-upload"
                          name="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="sr-only"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Recommended size: 200x200px. Max size: 2MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="banner" className="block">Banner Image (Optional)</Label>
                    <div className="flex items-center space-x-4">
                      {bannerPreview && (
                        <div className="relative">
                          <img 
                            src={bannerPreview} 
                            alt="Banner Preview" 
                            className="w-40 h-20 object-cover border rounded-md"
                          />
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
                            onClick={() => {
                              setBannerFile(null);
                              setBannerPreview(null);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      <div className="flex-1">
                        <Label 
                          htmlFor="banner-upload" 
                          className="cursor-pointer flex items-center justify-center w-full h-10 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <ImagePlus className="mr-2 h-4 w-4" />
                          {bannerPreview ? 'Change Banner' : 'Upload Banner'}
                        </Label>
                        <input
                          id="banner-upload"
                          name="banner"
                          type="file"
                          accept="image/*"
                          onChange={handleBannerChange}
                          className="sr-only"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Recommended size: 1200x300px. Max size: 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Brand Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="block">Brand Name*</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Slug (optional in form, will be auto-generated if not provided) */}
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="block">Slug (Optional)</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug || ''}
                      onChange={handleInputChange}
                      placeholder="auto-generated-if-empty"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to auto-generate from brand name
                    </p>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="block">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  {/* Featured Status */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleCheckboxChange('featured', !!checked)}
                    />
                    <Label htmlFor="featured">Featured Brand</Label>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleCheckboxChange('isActive', !!checked)}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(false);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>{editingBrand ? 'Update Brand' : 'Create Brand'}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirmationId} onOpenChange={(open) => !open && setDeleteConfirmationId(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this brand? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirmationId(null)}
                disabled={deleteBrandMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={deleteBrandMutation.isPending}
              >
                {deleteBrandMutation.isPending ? 'Deleting...' : 'Delete Brand'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}