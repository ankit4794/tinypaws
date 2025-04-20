import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { Check, X, Trash2, Star, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { withAdminRoute } from '@/lib/protected-route';
import AdminLayout from '@/components/admin/AdminLayout';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Review type definition
interface Review {
  _id: string;
  title: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  product: {
    _id: string;
    name: string;
    slug: string;
    images: string[];
  };
  user: {
    _id: string;
    username: string;
    email: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

const ReviewsPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // State for filters and pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Get reviews data
  const {
    data: reviewsData,
    isLoading,
    error,
  } = useQuery<ReviewsResponse>({
    queryKey: ['/api/admin/reviews', page, limit, status, searchTerm],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('limit', limit.toString());
      
      if (status) searchParams.append('status', status);
      if (searchTerm) searchParams.append('search', searchTerm);
      
      const res = await fetch(`/api/admin/reviews?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    }
  });

  // Approve/Reject review mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: string, status: string }) => {
      const response = await apiRequest(
        'PUT',
        '/api/admin/reviews',
        { reviewId, status }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
      toast({
        title: 'Review Updated',
        description: 'Review status has been updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update review status',
        variant: 'destructive',
      });
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await apiRequest(
        'DELETE',
        '/api/admin/reviews',
        { reviewId }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
      toast({
        title: 'Review Deleted',
        description: 'Review has been deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete review',
        variant: 'destructive',
      });
    },
  });

  // Handle approve review
  const handleApprove = (reviewId: string) => {
    updateStatusMutation.mutate({ reviewId, status: 'approved' });
  };

  // Handle reject review
  const handleReject = (reviewId: string) => {
    updateStatusMutation.mutate({ reviewId, status: 'rejected' });
  };

  // Handle delete review
  const handleDelete = (reviewId: string) => {
    deleteReviewMutation.mutate(reviewId);
  };

  // Pagination controls
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (reviewsData && page < reviewsData.pagination.totalPages) {
      setPage(page + 1);
    }
  };

  // Render stars for rating
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ));
  };

  // Status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  return (
    <>
      <Head>
        <title>Manage Reviews | TinyPaws Admin</title>
      </Head>
      <AdminLayout>
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Manage Reviews</h1>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter Reviews</CardTitle>
              <CardDescription>
                Use the filters below to find specific reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Search by Product or User
                  </label>
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
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
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => {
                  setPage(1);
                  // Reset all filters
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
                  <h3 className="text-xl font-semibold mb-2">Failed to load reviews</h3>
                  <p className="text-muted-foreground mb-4">
                    There was an error loading the reviews. Please try again later.
                  </p>
                  <Button onClick={() => router.reload()}>Retry</Button>
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
                        <TableHead>Product</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Review</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviewsData?.reviews.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            No reviews found
                          </TableCell>
                        </TableRow>
                      ) : (
                        reviewsData?.reviews.map((review) => (
                          <TableRow key={review._id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                {review.product.images && review.product.images[0] ? (
                                  <img
                                    src={review.product.images[0]}
                                    alt={review.product.name}
                                    className="h-10 w-10 rounded-md object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                    <AlertCircle className="h-5 w-5 text-gray-500" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium line-clamp-1">
                                    <Link 
                                      href={`/product/${review.product.slug}`}
                                      className="hover:underline"
                                    >
                                      {review.product.name}
                                    </Link>
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{review.user.fullName || review.user.username}</p>
                                <p className="text-sm text-muted-foreground">{review.user.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex">
                                {renderStars(review.rating)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{review.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {review.content}
                              </p>
                            </TableCell>
                            <TableCell>
                              {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(review.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {review.status !== 'approved' && (
                                  <Button
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600"
                                    onClick={() => handleApprove(review._id)}
                                    disabled={updateStatusMutation.isPending}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                {review.status !== 'rejected' && (
                                  <Button
                                    size="sm"
                                    className="bg-amber-500 hover:bg-amber-600"
                                    onClick={() => handleReject(review._id)}
                                    disabled={updateStatusMutation.isPending}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      disabled={deleteReviewMutation.isPending}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the
                                        review and remove it from our servers.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(review._id)}
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
                {reviewsData && reviewsData.pagination.total > 0 && (
                  <CardFooter className="flex items-center justify-between border-t p-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(page - 1) * limit + 1} to{" "}
                      {Math.min(page * limit, reviewsData.pagination.total)} of{" "}
                      {reviewsData.pagination.total} reviews
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
                        disabled={page >= reviewsData.pagination.totalPages}
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

export default withAdminRoute(ReviewsPage);

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};