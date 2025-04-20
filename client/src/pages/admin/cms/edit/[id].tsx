import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocation, useRoute } from 'wouter';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Save, ArrowLeft, Eye, Trash } from 'lucide-react';

// Form schema
const pageSchema = z.object({
  title: z.string().min(2, 'Title is required and must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  content: z.string().min(10, 'Content is required and must be at least 10 characters'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().default(false),
});

type PageFormValues = z.infer<typeof pageSchema>;

interface CmsPage extends PageFormValues {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditCmsPage() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute('/admin/cms/edit/:id');
  const pageId = params?.id as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewContent, setPreviewContent] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form
  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      isPublished: false,
    },
  });

  // Fetch page data
  const { data: page, isLoading, error } = useQuery<CmsPage>({
    queryKey: ['/api/admin/cms', pageId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/cms/${pageId}`);
      return response.json();
    },
    enabled: !!pageId,
  });

  // Update form when data is fetched
  useEffect(() => {
    if (page) {
      form.reset({
        title: page.title,
        slug: page.slug,
        content: page.content,
        metaTitle: page.metaTitle || '',
        metaDescription: page.metaDescription || '',
        isPublished: page.isPublished,
      });
    }
  }, [page, form]);

  // Update page mutation
  const updateMutation = useMutation({
    mutationFn: async (data: PageFormValues) => {
      const response = await apiRequest('PUT', `/api/admin/cms/${pageId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cms'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cms', pageId] });
      toast({
        title: 'Success',
        description: 'Page updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update the page',
        variant: 'destructive',
      });
    },
  });

  // Delete page mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/admin/cms/${pageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cms'] });
      toast({
        title: 'Success',
        description: 'Page deleted successfully',
      });
      navigate('/admin/cms');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete the page',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: PageFormValues) => {
    updateMutation.mutate(data);
  };

  // Handle delete confirmation
  const handleDelete = () => {
    deleteMutation.mutate();
  };

  // Generate slug from title
  const generateSlug = () => {
    const title = form.getValues('title');
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      form.setValue('slug', slug);
    }
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="py-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate('/admin/cms')} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pages
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Page</h2>
                <p className="text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : 'Failed to load page data'}
                </p>
                <Button onClick={() => navigate('/admin/cms')}>
                  Return to CMS Pages
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/admin/cms')} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pages
            </Button>
            <h1 className="text-2xl font-bold">
              {isLoading ? 'Loading...' : `Edit Page: ${page?.title}`}
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
            className="bg-red-50 border-red-200 hover:bg-red-100 text-red-600"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete Page
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg text-muted-foreground">Loading page data...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              {/* Left Column - Main Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Page Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="Page Title"
                        {...form.register('title')}
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="slug">Slug *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateSlug}
                        >
                          Generate from Title
                        </Button>
                      </div>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                          /
                        </span>
                        <Input
                          id="slug"
                          placeholder="page-slug"
                          className="rounded-l-none"
                          {...form.register('slug')}
                        />
                      </div>
                      {form.formState.errors.slug && (
                        <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="content">Content *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewContent(!previewContent)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {previewContent ? 'Edit' : 'Preview'}
                        </Button>
                      </div>
                      
                      {previewContent ? (
                        <div 
                          className="min-h-[300px] border rounded-md p-4 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: form.getValues('content') }}
                        />
                      ) : (
                        <Textarea
                          id="content"
                          placeholder="Page content (HTML supported)"
                          className="min-h-[300px]"
                          {...form.register('content')}
                        />
                      )}
                      
                      {form.formState.errors.content && (
                        <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Publishing Options */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Publishing Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="isPublished" className="cursor-pointer">Publish Page</Label>
                      <Switch
                        id="isPublished"
                        checked={form.watch('isPublished')}
                        onCheckedChange={(checked) => form.setValue('isPublished', checked)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {form.watch('isPublished')
                        ? 'This page will be visible to all users.'
                        : 'This page will be saved as a draft and won\'t be visible to users.'}
                    </p>
                    
                    {page && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(page.createdAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last updated: {new Date(page.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>SEO Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="metaTitle">Meta Title</Label>
                      <Input
                        id="metaTitle"
                        placeholder="Meta title (optional)"
                        {...form.register('metaTitle')}
                      />
                      <p className="text-xs text-muted-foreground">
                        Defaults to the page title if left empty
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="metaDescription">Meta Description</Label>
                      <Textarea
                        id="metaDescription"
                        placeholder="Meta description (optional)"
                        rows={3}
                        {...form.register('metaDescription')}
                      />
                      <p className="text-xs text-muted-foreground">
                        Short description for search engines
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the CMS page and
                remove it from the website.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}