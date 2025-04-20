import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocation } from 'wouter';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/components/admin/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Save, ArrowLeft, Eye } from 'lucide-react';

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

export default function CreateCmsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewContent, setPreviewContent] = useState(false);

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

  // Create page mutation
  const createMutation = useMutation({
    mutationFn: async (data: PageFormValues) => {
      const response = await apiRequest('POST', '/api/admin/cms', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cms'] });
      toast({
        title: 'Success',
        description: 'Page created successfully',
      });
      navigate('/admin/cms');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create the page',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: PageFormValues) => {
    createMutation.mutate(data);
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

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/admin/cms')} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pages
            </Button>
            <h1 className="text-2xl font-bold">Create New Page</h1>
          </div>
        </div>

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
                      onBlur={() => {
                        if (!form.getValues('slug')) {
                          generateSlug();
                        }
                      }}
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
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Page
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
      </div>
    </AdminLayout>
  );
}