import { useState } from 'react';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { User, Search, Trash, Plus, Send, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { AdminLayout } from '@/components/admin/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Newsletter subscriber type
interface NewsletterSubscriber {
  _id: string;
  email: string;
  active: boolean;
  createdAt: string;
}

interface SubscribersResponse {
  subscribers: NewsletterSubscriber[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Form schema for adding a subscriber
const addSubscriberSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

export default function NewsletterPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<string | null>(null);
  
  // State for filters and pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form for adding a subscriber
  const form = useForm<z.infer<typeof addSubscriberSchema>>({
    resolver: zodResolver(addSubscriberSchema),
    defaultValues: {
      email: '',
    },
  });

  // Get subscribers data
  const {
    data: subscribersData,
    isLoading,
    error,
  } = useQuery<SubscribersResponse>({
    queryKey: ['/api/admin/newsletter', page, limit, status, searchTerm],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('limit', limit.toString());
      
      if (status) searchParams.append('status', status);
      if (searchTerm) searchParams.append('search', searchTerm);
      
      const response = await apiRequest(
        'GET', 
        `/api/admin/newsletter?${searchParams.toString()}`
      );
      
      return response.json();
    },
  });

  // Add subscriber mutation
  const addSubscriberMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addSubscriberSchema>) => {
      const response = await apiRequest(
        'POST',
        '/api/admin/newsletter',
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/newsletter'] });
      toast({
        title: 'Subscriber Added',
        description: 'The email has been added to the newsletter list',
      });
      setAddDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add subscriber',
        variant: 'destructive',
      });
    },
  });

  // Delete subscriber mutation
  const deleteSubscriberMutation = useMutation({
    mutationFn: async (subscriberId: string) => {
      const response = await apiRequest(
        'DELETE',
        '/api/admin/newsletter',
        { subscriberId }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/newsletter'] });
      toast({
        title: 'Subscriber Deleted',
        description: 'The email has been removed from the newsletter list',
      });
      setDeleteDialogOpen(false);
      setSubscriberToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete subscriber',
        variant: 'destructive',
      });
    },
  });

  // Handle submit for adding a subscriber
  const onSubmit = (data: z.infer<typeof addSubscriberSchema>) => {
    addSubscriberMutation.mutate(data);
  };

  // Handle delete subscriber
  const handleDelete = () => {
    if (subscriberToDelete) {
      deleteSubscriberMutation.mutate(subscriberToDelete);
    }
  };

  // Open delete dialog
  const openDeleteDialog = (subscriberId: string) => {
    setSubscriberToDelete(subscriberId);
    setDeleteDialogOpen(true);
  };

  // Pagination controls
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (subscribersData && page < subscribersData.pagination.totalPages) {
      setPage(page + 1);
    }
  };

  // Get the subscriber email by ID
  const getSubscriberEmail = (id: string): string => {
    const subscriber = subscribersData?.subscribers.find(sub => sub._id === id);
    return subscriber ? subscriber.email : '';
  };

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
          <div className="flex space-x-2">
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subscriber
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Newsletter Subscriber</DialogTitle>
                  <DialogDescription>
                    Add a new email address to the newsletter list. The subscriber will be active immediately.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="subscriber@example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter a valid email address
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={addSubscriberMutation.isPending}
                      >
                        {addSubscriberMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Subscriber
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Send Newsletter
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Subscribers</CardTitle>
            <CardDescription>
              Use the filters below to find specific subscribers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Search by Email
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Status
                </label>
                <Select
                  value={status}
                  onValueChange={setStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Items per page
                </label>
                <Select
                  value={limit.toString()}
                  onValueChange={(value) => setLimit(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="20" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => {
                setPage(1);
                setSearchTerm('');
                setStatus('');
              }}
            >
              Reset Filters
            </Button>
          </CardFooter>
        </Card>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center p-6">
                <div className="h-10 w-10 text-red-500 mb-4">⚠️</div>
                <h3 className="text-xl font-semibold mb-2">Failed to load subscribers</h3>
                <p className="text-muted-foreground mb-4">
                  There was an error loading the newsletter subscribers. Please try again later.
                </p>
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/newsletter'] })}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Subscribed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribersData?.subscribers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          No subscribers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscribersData?.subscribers.map((subscriber) => (
                        <TableRow key={subscriber._id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <User className="h-5 w-5 text-muted-foreground" />
                              <span>{subscriber.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {subscriber.active ? (
                              <Badge className="bg-green-500">Active</Badge>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(subscriber.createdAt), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 hover:bg-red-50 text-red-600"
                                onClick={() => openDeleteDialog(subscriber._id)}
                                disabled={deleteSubscriberMutation.isPending}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              {subscribersData && subscribersData.pagination.totalPages > 1 && (
                <CardFooter className="flex justify-between items-center py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {subscribersData.subscribers.length} of {subscribersData.pagination.total} subscribers
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="px-2 py-1 bg-muted rounded text-sm">
                      Page {page} of {subscribersData.pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={page === subscribersData.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove {subscriberToDelete && getSubscriberEmail(subscriberToDelete)} from your newsletter subscribers list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteSubscriberMutation.isPending}
              >
                {deleteSubscriberMutation.isPending ? (
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