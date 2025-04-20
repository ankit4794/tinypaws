import { useState } from 'react';
import { format } from 'date-fns';
import { Star, Search, Trash2, Check, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';

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
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Review type
interface Review {
  _id: string;
  productId: string;
  productName: string;
  productSlug: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
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
  const [, setLocation] = useLocation(); // wouter hook instead of next/router
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // State for filters and pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string>('');
  const [rating, setRating] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Get reviews data
  const {
    data: reviewsData,
    isLoading,
    error,
  } = useQuery<ReviewsResponse>({
    queryKey: ['/api/admin/reviews', page, limit, status, rating, searchTerm],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('limit', limit.toString());
      
      if (status && status !== 'all') searchParams.append('status', status);
      if (rating && rating !== 'all') searchParams.append('rating', rating);
      if (searchTerm) searchParams.append('search', searchTerm);
      
      const res = await fetch(`/api/admin/reviews?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      return res.json();
    }
  });

  // Update review mutation
  const updateReviewMutation = useMutation({
    mutationFn: async ({ 
      reviewId, 
      status,
    }: { 
      reviewId: string; 
      status: 'pending' | 'approved' | 'rejected'; 
    }) => {
      const response = await apiRequest(
        'PUT',
        '/api/admin/reviews',
        { reviewId, status }
      );
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews'] });
      
      if (selectedReview) {
        setSelectedReview(data); // Update selected review with new data
      }
      
      toast({
        title: 'Review Updated',
        description: 'Review status has been updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update review',
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
      
      if (viewDialogOpen) {
        setViewDialogOpen(false);
      }
      
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

  // Handle view review details
  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
  };

  // Handle update status
  const handleUpdateStatus = (reviewId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    updateReviewMutation.mutate({ reviewId, status: newStatus });
  };

  // Handle delete review
  const handleDeleteReview = (reviewId: string) => {
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

  // Status badge color and text
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Rating stars
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm">{rating}</span>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Product Reviews</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Reviews</CardTitle>
            <CardDescription>
              Use the filters below to find specific product reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, product, user..."
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
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Rating
                </label>
                <Select
                  value={rating}
                  onValueChange={setRating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
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
                setSearchTerm('');
                setStatus('all');
                setRating('all');
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
                  There was an error loading the product reviews. Please try again later.
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
                      <TableHead>Product</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
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
                          <TableCell className="font-medium">{review.productName}</TableCell>
                          <TableCell>
                            <Button 
                              variant="link" 
                              className="p-0 h-auto font-medium text-left"
                              onClick={() => handleViewReview(review)}
                            >
                              {review.title || 'Review'}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{review.userName}</p>
                              <p className="text-sm text-muted-foreground">{review.userEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {renderRatingStars(review.rating)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(review.status)}
                          </TableCell>
                          <TableCell>
                            {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    title="Delete review"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete this review.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteReview(review._id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-green-500 text-white hover:bg-green-600"
                                title="Approve review"
                                onClick={() => handleUpdateStatus(review._id, 'approved')}
                                disabled={review.status === 'approved'}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              {reviewsData && reviewsData.pagination.totalPages > 1 && (
                <CardFooter className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Showing {((page - 1) * limit) + 1}-
                    {Math.min(page * limit, reviewsData.pagination.total)} of {reviewsData.pagination.total}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrevPage}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous Page</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
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
      
      {/* Review details dialog */}
      {selectedReview && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedReview.title || 'Review'}</DialogTitle>
              <DialogDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  {getStatusBadge(selectedReview.status)}
                  <Badge variant="outline">{format(new Date(selectedReview.createdAt), 'MMM dd, yyyy')}</Badge>
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Product</h3>
                  <p>{selectedReview.productName}</p>
                </div>
                <div>
                  <h3 className="font-medium">Rating</h3>
                  {renderRatingStars(selectedReview.rating)}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">User</h3>
                <p>{selectedReview.userName} ({selectedReview.userEmail})</p>
              </div>
              
              <div>
                <h3 className="font-medium">Comment</h3>
                <p className="mt-1">{selectedReview.comment}</p>
              </div>
              
              <div className="border-t pt-4 mt-2">
                <h3 className="font-medium mb-2">Actions</h3>
                <div className="flex space-x-3">
                  <Button
                    variant={selectedReview.status === 'pending' ? 'default' : 'outline'}
                    onClick={() => handleUpdateStatus(selectedReview._id, 'pending')}
                    disabled={updateReviewMutation.isPending}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Mark as Pending
                  </Button>
                  <Button
                    variant={selectedReview.status === 'approved' ? 'default' : 'outline'}
                    onClick={() => handleUpdateStatus(selectedReview._id, 'approved')}
                    disabled={updateReviewMutation.isPending}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant={selectedReview.status === 'rejected' ? 'default' : 'outline'}
                    onClick={() => handleUpdateStatus(selectedReview._id, 'rejected')}
                    disabled={updateReviewMutation.isPending}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Reject
                  </Button>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-2">
                <h3 className="font-medium mb-2">Danger Zone</h3>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Review
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this review.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteReview(selectedReview._id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setViewDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
};

export default ReviewsPage;