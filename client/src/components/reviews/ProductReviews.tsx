import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Star, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { format } from 'date-fns';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
  reviewsWithImages: number;
  verifiedPurchases: number;
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();

  // Fetch product reviews
  const { data: reviewsData, isLoading: isReviewsLoading } = useQuery({
    queryKey: [
      `/api/reviews/product/${productId}`, 
      page, 
      limit, 
      sortBy, 
      filterRating
    ],
    queryFn: async () => {
      let url = `/api/reviews/product/${productId}?page=${page}&limit=${limit}`;
      if (sortBy) url += `&sort=${sortBy}`;
      if (filterRating) url += `&rating=${filterRating}`;
      
      const res = await apiRequest('GET', url);
      return res.json();
    },
  });

  // Fetch review summary
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: [`/api/reviews/product/${productId}/summary`],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/reviews/product/${productId}/summary`);
      return res.json();
    },
  });

  // Check if user has already reviewed this product
  const { data: userReview, isLoading: isUserReviewLoading } = useQuery({
    queryKey: [`/api/reviews/user/product/${productId}`],
    queryFn: async () => {
      if (!user) return null;
      try {
        const res = await apiRequest('GET', `/api/reviews/user/product/${productId}`);
        return res.json();
      } catch (error) {
        // If 404, user hasn't reviewed yet
        if (error.status === 404) return null;
        throw error;
      }
    },
    enabled: !!user,
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: {
      productId: string;
      rating: number;
      title?: string;
      review?: string;
      images?: string[];
    }) => {
      const res = await apiRequest('POST', '/api/reviews', reviewData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Review submitted',
        description: 'Your review has been submitted for approval. Thank you for your feedback!',
      });
      setShowReviewForm(false);
      setReviewTitle('');
      setReviewText('');
      setReviewRating(5);
      setReviewImages([]);
      setUploadedImages([]);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: [`/api/reviews/product/${productId}`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/reviews/product/${productId}/summary`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/reviews/user/product/${productId}`] 
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to submit review',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mark review as helpful/unhelpful
  const helpfulReviewMutation = useMutation({
    mutationFn: async ({ reviewId, isHelpful }: { reviewId: string; isHelpful: boolean }) => {
      const res = await apiRequest('POST', `/api/reviews/${reviewId}/helpful`, { isHelpful });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/reviews/product/${productId}`] 
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to write a review',
        variant: 'destructive',
      });
      return;
    }

    if (reviewRating < 1) {
      toast({
        title: 'Rating required',
        description: 'Please select a rating',
        variant: 'destructive',
      });
      return;
    }

    // TODO: Handle image uploads first
    // This is a placeholder for image upload
    // In a real implementation, you would upload images first
    // Then include the URLs in the review submission

    submitReviewMutation.mutate({
      productId,
      rating: reviewRating,
      title: reviewTitle || undefined,
      review: reviewText || undefined,
      images: reviewImages.length ? reviewImages : undefined,
    });
  };

  const handleMarkHelpful = (reviewId: string, isHelpful: boolean) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to mark reviews as helpful',
      });
      return;
    }

    helpfulReviewMutation.mutate({ reviewId, isHelpful });
  };

  const handleFilterChange = (rating: string) => {
    setFilterRating(rating ? parseInt(rating) : null);
    setPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setPage(1);
  };

  // Calculate total pages
  const totalReviews = reviewsData?.total || 0;
  const totalPages = Math.ceil(totalReviews / limit);

  // Render star rating
  const renderStarRating = (rating: number, size = 'w-5 h-5') => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`${size} ${
            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ));
  };

  // Render rating input for the review form
  const renderRatingInput = () => {
    return (
      <div className="flex items-center space-x-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setReviewRating(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 ${
                star <= reviewRating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Render rating distribution from summary
  const renderRatingDistribution = () => {
    if (isSummaryLoading || !summaryData) return null;

    return (
      <div className="space-y-2 mt-4">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = summaryData.ratingDistribution[rating] || 0;
          const percentage =
            summaryData.totalReviews > 0
              ? Math.round((count / summaryData.totalReviews) * 100)
              : 0;

          return (
            <div key={rating} className="flex items-center gap-2">
              <div className="flex items-center w-16">
                {rating}{' '}
                <Star className="w-4 h-4 ml-1 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-12 text-xs text-right">
                {count} ({percentage}%)
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Check if user can leave a review
  const canReview = user && !userReview && !isUserReviewLoading;

  return (
    <div className="mt-8">
      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="write">Write a Review</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review Summary */}
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Review Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {isSummaryLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-10 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ) : summaryData ? (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-4xl font-bold">
                          {summaryData.averageRating.toFixed(1)}
                        </span>
                        <div className="flex flex-col">
                          <div className="flex">
                            {renderStarRating(summaryData.averageRating)}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {summaryData.totalReviews} reviews
                          </span>
                        </div>
                      </div>

                      {summaryData.verifiedPurchases > 0 && (
                        <div className="mb-4">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {summaryData.verifiedPurchases} verified purchases
                          </Badge>
                        </div>
                      )}

                      {renderRatingDistribution()}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No reviews yet</p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex-col items-start gap-4">
                  <div className="w-full">
                    <Label htmlFor="filter-rating">Filter by Rating</Label>
                    <Select
                      value={filterRating?.toString() || ''}
                      onValueChange={handleFilterChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All ratings" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All ratings</SelectItem>
                        <SelectItem value="5">5 stars</SelectItem>
                        <SelectItem value="4">4 stars</SelectItem>
                        <SelectItem value="3">3 stars</SelectItem>
                        <SelectItem value="2">2 stars</SelectItem>
                        <SelectItem value="1">1 star</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full">
                    <Label htmlFor="sort-reviews">Sort by</Label>
                    <Select value={sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Most Recent</SelectItem>
                        <SelectItem value="helpful">Most Helpful</SelectItem>
                        <SelectItem value="rating_desc">Highest Rating</SelectItem>
                        <SelectItem value="rating_asc">Lowest Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {canReview && (
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => setShowReviewForm(true)}
                    >
                      Write a Review
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>

            {/* Reviews List */}
            <div className="col-span-1 md:col-span-2">
              {isReviewsLoading ? (
                <div className="animate-pulse space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  ))}
                </div>
              ) : reviewsData?.reviews?.length ? (
                <div className="space-y-6">
                  {reviewsData.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {renderStarRating(review.rating, 'w-4 h-4')}
                              </div>
                              {review.isVerifiedPurchase && (
                                <Badge variant="outline" className="text-xs">
                                  Verified Purchase
                                </Badge>
                              )}
                            </div>
                            {review.title && (
                              <CardTitle className="text-lg mt-2">
                                {review.title}
                              </CardTitle>
                            )}
                          </div>
                          <CardDescription className="text-xs">
                            {format(new Date(review.createdAt), 'MMM d, yyyy')}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-sm">{review.review}</p>

                          {/* Review Images */}
                          {review.images?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {review.images.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt={`Review image ${i + 1}`}
                                  className="h-20 w-20 object-cover rounded"
                                />
                              ))}
                            </div>
                          )}

                          {/* Admin Reply */}
                          {review.adminReply && (
                            <div className="mt-4 pl-4 border-l-2 border-muted">
                              <p className="text-sm font-semibold">
                                Seller Response:
                              </p>
                              <p className="text-sm mt-1">
                                {review.adminReply.text}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(
                                  new Date(review.adminReply.date),
                                  'MMM d, yyyy'
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <div className="text-xs text-muted-foreground">
                          By {review.user?.username || 'Anonymous'}
                        </div>
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs flex items-center space-x-1"
                            onClick={() => handleMarkHelpful(review.id, true)}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span>Helpful ({review.isHelpful || 0})</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs flex items-center space-x-1"
                            onClick={() => handleMarkHelpful(review.id, false)}
                          >
                            <ThumbsDown className="h-3 w-3" />
                            <span>Not Helpful ({review.isNotHelpful || 0})</span>
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <h3 className="text-lg font-semibold mb-2">
                        No reviews yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Be the first to review this product
                      </p>
                      {canReview && (
                        <Button onClick={() => setShowReviewForm(true)}>
                          Write a Review
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="write" className="mt-6">
          {!user ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">
                    Please log in to write a review
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You need to be logged in to share your experience with this product
                  </p>
                  <Button>Login</Button>
                </div>
              </CardContent>
            </Card>
          ) : userReview ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">
                    You've already reviewed this product
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Thank you for sharing your feedback!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Write Your Review</CardTitle>
                <CardDescription>
                  Share your experience with this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    {renderRatingInput()}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Review Title</Label>
                    <Input
                      id="title"
                      placeholder="Summarize your experience"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="review">Review</Label>
                    <Textarea
                      id="review"
                      placeholder="What did you like or dislike about this product?"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={5}
                    />
                  </div>

                  {/* Image upload section - simplified version */}
                  <div className="space-y-2">
                    <Label>Add Photos (Optional)</Label>
                    <div className="border-2 border-dashed border-muted rounded-md p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload images to help other customers (max 5 images)
                      </p>
                      <Button variant="outline" size="sm" disabled>
                        Upload Photos (Coming Soon)
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitReview}
                  disabled={reviewRating === 0 || submitReviewMutation.isPending}
                >
                  {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Form Dialog (Mobile) */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write Your Review</DialogTitle>
            <DialogDescription>
              Share your experience with this product
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rating-dialog">Rating</Label>
              {renderRatingInput()}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title-dialog">Review Title</Label>
              <Input
                id="title-dialog"
                placeholder="Summarize your experience"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-dialog">Review</Label>
              <Textarea
                id="review-dialog"
                placeholder="What did you like or dislike about this product?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewForm(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReview}
              disabled={reviewRating === 0 || submitReviewMutation.isPending}
            >
              {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductReviews;