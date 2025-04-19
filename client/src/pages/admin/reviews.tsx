import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Star, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Trash, 
  MessageSquare, 
  Filter, 
  RefreshCcw,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/use-auth';
import { useAdminReviews, ReviewFilterParams } from '@/hooks/admin/use-admin-reviews';
import { format } from 'date-fns';

const AdminReviews = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ReviewFilterParams>({});
  const [replyText, setReplyText] = useState('');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    query, 
    approveReviewMutation, 
    rejectReviewMutation, 
    deleteReviewMutation, 
    replyToReviewMutation,
    reviewAnalyticsQuery
  } = useAdminReviews(page, limit, filters);

  const { isLoading, data } = query;
  const { isLoading: isAnalyticsLoading, data: analyticsData } = reviewAnalyticsQuery;

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const handleSearch = () => {
    // Implement search logic here based on product name or user
    // This would require backend support for text search
    toast({
      title: "Search functionality",
      description: "Search will be implemented in a future update.",
    });
  };

  const handleApprove = (reviewId: string) => {
    approveReviewMutation.mutate(reviewId, {
      onSuccess: () => {
        toast({
          title: "Review approved",
          description: "The review is now visible to customers",
        });
      },
      onError: (error) => {
        toast({
          title: "Failed to approve review",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleReject = (reviewId: string) => {
    rejectReviewMutation.mutate(reviewId, {
      onSuccess: () => {
        toast({
          title: "Review rejected",
          description: "The review has been rejected",
        });
      },
      onError: (error) => {
        toast({
          title: "Failed to reject review",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleDelete = (reviewId: string) => {
    if (confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      deleteReviewMutation.mutate(reviewId, {
        onSuccess: () => {
          toast({
            title: "Review deleted",
            description: "The review has been deleted",
          });
        },
        onError: (error) => {
          toast({
            title: "Failed to delete review",
            description: error.message,
            variant: "destructive",
          });
        }
      });
    }
  };

  const openReplyDialog = (review: any) => {
    setSelectedReview(review);
    setReplyText(review.adminReply?.text || '');
    setIsReplyDialogOpen(true);
  };

  const handleReplySubmit = () => {
    if (!selectedReview || !replyText.trim()) return;
    
    replyToReviewMutation.mutate(
      { reviewId: selectedReview.id, replyText },
      {
        onSuccess: () => {
          toast({
            title: "Reply submitted",
            description: "Your reply has been posted to the review",
          });
          setIsReplyDialogOpen(false);
          setReplyText('');
          setSelectedReview(null);
        },
        onError: (error) => {
          toast({
            title: "Failed to submit reply",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    );
  };

  const handleFilterChange = (key: keyof ReviewFilterParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const renderReviewStatus = (status: string, isVerified: boolean) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderRatingDistribution = () => {
    if (isAnalyticsLoading || !analyticsData) return null;
    
    return (
      <div className="flex flex-col space-y-2">
        <h3 className="text-sm font-medium">Rating Distribution</h3>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = analyticsData.ratingDistribution[rating] || 0;
          const percentage = analyticsData.total > 0 
            ? Math.round((count / analyticsData.total) * 100) 
            : 0;
          
          return (
            <div key={rating} className="flex items-center gap-2">
              <div className="flex items-center w-16">
                {rating} <Star className="w-4 h-4 ml-1 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-yellow-400 h-2.5 rounded-full" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-xs w-12">{count} ({percentage}%)</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFilterDialog = () => (
    <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Reviews</DialogTitle>
          <DialogDescription>
            Apply filters to narrow down the reviews list
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rating" className="text-right">
              Rating
            </Label>
            <Select 
              value={filters.rating?.toString() || ''} 
              onValueChange={(val) => handleFilterChange('rating', val ? parseInt(val) : undefined)}
            >
              <SelectTrigger className="w-full col-span-3">
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any rating</SelectItem>
                <SelectItem value="5">5 stars</SelectItem>
                <SelectItem value="4">4 stars</SelectItem>
                <SelectItem value="3">3 stars</SelectItem>
                <SelectItem value="2">2 stars</SelectItem>
                <SelectItem value="1">1 star</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select 
              value={filters.status || ''} 
              onValueChange={(val) => handleFilterChange('status', val || undefined)}
            >
              <SelectTrigger className="w-full col-span-3">
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="verified" className="text-right">
              Verified
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Checkbox 
                id="verified" 
                checked={filters.isVerifiedPurchase}
                onCheckedChange={(checked) => 
                  handleFilterChange('isVerifiedPurchase', checked === true ? true : undefined)
                } 
              />
              <label htmlFor="verified" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Show only verified purchase reviews
              </label>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              From Date
            </Label>
            <Input
              id="startDate"
              className="col-span-3"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              To Date
            </Label>
            <Input
              id="endDate"
              className="col-span-3"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={clearFilters}>
            Clear All
          </Button>
          <Button onClick={() => {
            setPage(1);
            setIsFilterDialogOpen(false);
          }}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderReplyDialog = () => (
    <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Reply to Review</DialogTitle>
          <DialogDescription>
            Your reply will be visible to all customers viewing this review
          </DialogDescription>
        </DialogHeader>
        {selectedReview && (
          <div className="border rounded-md p-4 my-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {renderStars(selectedReview.rating)}
                </div>
                <span className="text-sm font-medium">
                  {selectedReview.title || `Review by ${selectedReview.user?.username || 'Anonymous'}`}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {format(new Date(selectedReview.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
            <p className="mt-2 text-sm">{selectedReview.review}</p>
          </div>
        )}
        <div className="grid gap-4 py-4">
          <Label htmlFor="reply">Your Reply</Label>
          <Textarea
            id="reply"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your response here..."
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsReplyDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReplySubmit}
            disabled={!replyText.trim()}
          >
            Post Reply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Customer Reviews</h1>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-8"
              />
              <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setIsFilterDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="flex items-center gap-1"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Review Statistics</CardTitle>
              <CardDescription>Overall rating metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyticsLoading ? (
                <div className="animate-pulse flex flex-col space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ) : analyticsData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Reviews</span>
                    <span className="font-bold">{analyticsData.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Rating</span>
                    <div className="flex items-center">
                      <span className="font-bold mr-2">{analyticsData.averageRating?.toFixed(1) || 'N/A'}</span>
                      {analyticsData.averageRating ? (
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pending Reviews</span>
                    <span className="font-bold">{analyticsData.pendingCount || 0}</span>
                  </div>
                  <div className="border-t my-4"></div>
                  {renderRatingDistribution()}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-3">
            <CardHeader>
              <CardTitle>Review List</CardTitle>
              <CardDescription>
                Manage customer reviews and ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : data?.reviews?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          <div className="font-medium truncate max-w-[150px]">
                            {review.product?.name || "Unknown Product"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {review.user?.username || "Anonymous"}
                            {review.isVerifiedPurchase && (
                              <Badge variant="outline" className="ml-1 text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="truncate max-w-[200px]">
                            {review.title ? (
                              <span className="font-medium">{review.title}</span>
                            ) : null}
                            <p className="text-sm text-muted-foreground truncate">
                              {review.review || "<No text review>"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(review.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {renderReviewStatus(review.status, review.isVerifiedPurchase)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {review.status !== 'approved' && (
                                <DropdownMenuItem onClick={() => handleApprove(review.id)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              {review.status !== 'rejected' && (
                                <DropdownMenuItem onClick={() => handleReject(review.id)}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => openReplyDialog(review)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                {review.adminReply ? 'Edit Reply' : 'Reply'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(review.id)}>
                                <Trash className="mr-2 h-4 w-4" />
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
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No reviews found</p>
                  {Object.keys(filters).length > 0 && (
                    <Button 
                      variant="link" 
                      onClick={clearFilters}
                      className="mt-2"
                    >
                      Clear filters and try again
                    </Button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {data?.total > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.total)} of {data.total} reviews
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {page} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {renderFilterDialog()}
      {renderReplyDialog()}
    </AdminLayout>
  );
};

export default AdminReviews;