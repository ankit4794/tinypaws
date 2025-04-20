import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { withAdminProtectedRoute } from '@/lib/admin-protected-route';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Define schema for CMS page form
const cmsPageSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  slug: z.string().min(2, { message: 'Slug must be at least 2 characters' }),
  content: z.string().min(10, { message: 'Content must be at least 10 characters' }),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type CmsPageFormValues = z.infer<typeof cmsPageSchema>;

function CMSManagementPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingPage, setEditingPage] = React.useState<any>(null);

  // Query to fetch CMS pages
  const { data: cmsPages, isLoading } = useQuery({
    queryKey: ['/api/admin/cms-pages'],
    retry: 1,
  });

  // Form
  const form = useForm<CmsPageFormValues>({
    resolver: zodResolver(cmsPageSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CmsPageFormValues) => {
      return apiRequest('POST', '/api/admin/cms-pages', data).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'CMS page created successfully',
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cms-pages'] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: CmsPageFormValues & { _id: string }) => {
      const { _id, ...pageData } = data;
      return apiRequest('PATCH', `/api/admin/cms-pages/${_id}`, pageData).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'CMS page updated successfully',
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cms-pages'] });
      setEditingPage(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/cms-pages/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'CMS page deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cms-pages'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: CmsPageFormValues) => {
    if (editingPage) {
      updateMutation.mutate({ ...data, _id: editingPage._id });
    } else {
      createMutation.mutate(data);
    }
  };

  // Handle edit button click
  const handleEdit = (page: any) => {
    setEditingPage(page);
    form.reset({
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
    });
    setIsDialogOpen(true);
  };

  // Handle add new button click
  const handleAddNew = () => {
    setEditingPage(null);
    form.reset({
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
    });
    setIsDialogOpen(true);
  };

  // Handle delete button click
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this CMS page?')) {
      deleteMutation.mutate(id);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingPage(null);
    form.reset();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">CMS Pages</h1>
          <p className="text-muted-foreground">Manage website content pages</p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Page
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Pages</CardTitle>
          <CardDescription>View and manage all CMS pages</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cmsPages?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cmsPages.map((page: any) => (
                  <TableRow key={page._id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>{page.slug}</TableCell>
                    <TableCell>
                      {new Date(page.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(page)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(page._id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No CMS pages found. Create your first page by clicking "Add New Page".
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? 'Edit CMS Page' : 'Create New CMS Page'}
            </DialogTitle>
            <DialogDescription>
              {editingPage
                ? 'Update the details of your CMS page'
                : 'Add a new page to your website content'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Page Title" {...field} />
                    </FormControl>
                    <FormDescription>
                      The title of the page as it will appear on the website.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="page-slug" {...field} />
                    </FormControl>
                    <FormDescription>
                      The URL-friendly version of the title. No spaces, all lowercase.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Page content in HTML format"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The main content of the page in HTML format.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title (SEO)</FormLabel>
                    <FormControl>
                      <Input placeholder="Meta Title" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional. The title that appears in search engine results.
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
                    <FormLabel>Meta Description (SEO)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Meta Description"
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional. A short description that appears in search engine results.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingPage ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>{editingPage ? 'Update Page' : 'Create Page'}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAdminProtectedRoute(CMSManagementPage);