import { useState } from 'react';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { User, Search, Trash2, Plus, Send, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
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
  AlertDialogTrigger,
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

const NewsletterPage = () => {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
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
      
      const res = await fetch(`/api/admin/newsletter?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch subscribers');
      return res.json();
    }
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
  const handleDelete = (subscriberId: string) => {
    deleteSubscriberMutation.mutate(subscriberId);
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

  return (
    <>
      <AdminLayout>
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
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
                              <span className="mr-2">Adding...</span>
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
                  <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Failed to load subscribers</h3>
                  <p className="text-muted-foreground mb-4">
                    There was an error loading the newsletter subscribers. Please try again later.
                  </p>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
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
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      disabled={deleteSubscriberMutation.isPending}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently remove {subscriber.email} from your newsletter subscribers list.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(subscriber._id)}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                {subscribersData && subscribersData.pagination.total > 0 && (
                  <CardFooter className="flex items-center justify-between border-t p-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(page - 1) * limit + 1} to{" "}
                      {Math.min(page * limit, subscribersData.pagination.total)} of{" "}
                      {subscribersData.pagination.total} subscribers
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePrevPage}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous Page</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleNextPage}
                        disabled={page >= subscribersData.pagination.totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next Page</span>
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

// Export the component directly - route protection should be handled in App.tsx
export default NewsletterPage;