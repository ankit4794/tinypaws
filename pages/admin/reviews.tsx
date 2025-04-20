import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Star, Loader2, Trash2, Check, X, Edit, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { withAdminProtectedRoute } from '@/lib/admin-protected-route';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

function ReviewsPage() {
  const { toast } = useToast();
  const [selectedReview, setSelectedReview] = React.useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [adminReply, setAdminReply] = React.useState('');
  const [currentFilter, setCurrentFilter] = React.useState('all');

  // Query to fetch product reviews
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['/api/admin/reviews', currentFilter],
    retry: 1,
  });

  // Approve review mutation
  const approveReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('PATCH', `/api/admin/reviews/${id}/approve`, {})
        .then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Review approved successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews', currentFilter] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Reject review mutation
  const rejectReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('PATCH', `/api/admin/reviews/${id}/reject`, {})
        .then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Review rejected successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews', currentFilter] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Reply to review mutation
  const replyReviewMutation = useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
      return apiRequest('POST', `/api/admin/reviews/${id}/reply`, { reply })
        .then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Reply added successfully',
      });
      setAdminReply('');
      setIsViewDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews', currentFilter] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/reviews/${id}`)
        .then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Review deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reviews', currentFilter] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle view review
  const handleViewReview = (review: any) => {
    setSelectedReview(review);
    setAdminReply(review.adminReply || '');
    setIsViewDialogOpen(true);
  };

  // Handle approve review
  const handleApproveReview = (id: string) => {
    approveReviewMutation.mutate(id);
  };

  // Handle reject review
  const handleRejectReview = (id: string) => {
    rejectReviewMutation.mutate(id);
  };

  // Handle delete review
  const handleDeleteReview = (id: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteReviewMutation.mutate(id);
    }
  };

  // Handle submit reply
  const handleSubmitReply = () => {
    if (selectedReview && adminReply.trim()) {
      replyReviewMutation.mutate({ id: selectedReview._id, reply: adminReply });
    }
  };

  // Render stars for rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Product Reviews</h1>
          <p className="text-muted-foreground">Manage customer product reviews</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={currentFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setCurrentFilter('all')}
          >
            All
          </Button>
          <Button
            variant={currentFilter === 'pending' ? 'default' : 'outline'}
            onClick={() => setCurrentFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={currentFilter === 'approved' ? 'default' : 'outline'}
            onClick={() => setCurrentFilter('approved')}
          >
            Approved
          </Button>
          <Button
            variant={currentFilter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setCurrentFilter('rejected')}
          >
            Rejected
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Reviews</CardTitle>
          <CardDescription>
            Manage and moderate customer reviews for your products
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reviews?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review: any) => (
                  <TableRow key={review._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {review.user?.fullName?.[0] || review.user?.email?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {review.user?.fullName || review.user?.email || 'Anonymous'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{review.product?.name}</span>
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell>
                      <p className="truncate max-w-[15rem]">{review.review}</p>
                    </TableCell>
                    <TableCell>
                      {review.status === 'approved' ? (
                        <Badge variant="success">Approved</Badge>
                      ) : review.status === 'rejected' ? (
                        <Badge variant="destructive">Rejected</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(review.createdAt), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewReview(review)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            View & Reply
                          </DropdownMenuItem>
                          {review.status !== 'approved' && (
                            <DropdownMenuItem onClick={() => handleApproveReview(review._id)}>
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {review.status !== 'rejected' && (
                            <DropdownMenuItem onClick={() => handleRejectReview(review._id)}>
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteReview(review._id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No reviews found matching your filter criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Detail Dialog */}
      {selectedReview && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Details</DialogTitle>
              <DialogDescription>
                View and respond to customer review
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedReview.user?.fullName?.[0] || selectedReview.user?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedReview.user?.fullName || selectedReview.user?.email || 'Anonymous'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedReview.createdAt), 'dd MMM yyyy, HH:mm')}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    selectedReview.status === 'approved'
                      ? 'success'
                      : selectedReview.status === 'rejected'
                      ? 'destructive'
                      : 'outline'
                  }
                >
                  {selectedReview.status.charAt(0).toUpperCase() + selectedReview.status.slice(1)}
                </Badge>
              </div>

              <div>
                <p className="font-medium">Product:</p>
                <p>{selectedReview.product?.name}</p>
              </div>

              <div>
                <p className="font-medium">Rating:</p>
                <div className="flex items-center gap-2">
                  {renderStars(selectedReview.rating)}
                  <span>{selectedReview.rating}/5</span>
                </div>
              </div>

              <div>
                <p className="font-medium">Review:</p>
                <div className="bg-muted p-4 rounded-md mt-1">
                  <p className="whitespace-pre-wrap">{selectedReview.review}</p>
                </div>
              </div>

              {selectedReview.adminReply && (
                <div>
                  <p className="font-medium">Admin Reply:</p>
                  <div className="bg-primary/10 p-4 rounded-md mt-1">
                    <p className="whitespace-pre-wrap">{selectedReview.adminReply}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="font-medium mb-2">Your Reply:</p>
                <Textarea
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  placeholder="Enter your response to the customer review..."
                  className="min-h-24"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <div className="flex flex-1 justify-start gap-2">
                {selectedReview.status !== 'approved' && (
                  <Button
                    variant="outline"
                    onClick={() => handleApproveReview(selectedReview._id)}
                    disabled={approveReviewMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                )}
                {selectedReview.status !== 'rejected' && (
                  <Button
                    variant="outline"
                    onClick={() => handleRejectReview(selectedReview._id)}
                    disabled={rejectReviewMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleDeleteReview(selectedReview._id);
                  }}
                  disabled={deleteReviewMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
              <Button
                type="button"
                onClick={handleSubmitReply}
                disabled={!adminReply.trim() || replyReviewMutation.isPending}
              >
                {replyReviewMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4 mr-2" />
                )}
                Post Reply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default withAdminProtectedRoute(ReviewsPage);