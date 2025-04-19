import { Router } from 'express';
import { storage } from '../../storage';
import { insertAdminReplySchema } from '../../../shared/schema';
import { withAdminAuth } from '../../../middleware/admin-auth';

const router = Router();

// Get all reviews (paginated with filters)
router.get('/', withAdminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Extract filters
    const filters: Record<string, any> = {};
    
    if (req.query.productId) {
      filters.product = req.query.productId;
    }
    
    if (req.query.rating) {
      filters.rating = parseInt(req.query.rating as string);
    }
    
    if (req.query.isApproved !== undefined) {
      filters.isApproved = req.query.isApproved === 'true';
    }
    
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    // Date range filters
    if (req.query.startDate && req.query.endDate) {
      filters.createdAt = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    } else if (req.query.startDate) {
      filters.createdAt = {
        $gte: new Date(req.query.startDate as string),
      };
    } else if (req.query.endDate) {
      filters.createdAt = {
        $lte: new Date(req.query.endDate as string),
      };
    }
    
    const [reviews, total] = await Promise.all([
      storage.getReviews(skip, limit, filters),
      storage.getReviewsCount(filters),
    ]);
    
    res.json({
      reviews,
      total,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get review analytics (rating distribution, etc.)
router.get('/analytics', withAdminAuth, async (req, res) => {
  try {
    const analytics = await storage.getReviewsAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching review analytics:', error);
    res.status(500).json({ error: 'Failed to fetch review analytics' });
  }
});

// Get a specific review
router.get('/:id', withAdminAuth, async (req, res) => {
  try {
    const review = await storage.getReview(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// Approve a review
router.patch('/:id/approve', withAdminAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await storage.getReview(reviewId);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const updatedReview = await storage.updateReview(reviewId, {
      isApproved: true,
      status: 'approved',
    });
    
    // If this review is for a product, update the product's rating
    await storage.updateProductRating(review.product.toString());
    
    // Log activity
    await storage.logActivity({
      user: req.session.user.id,
      action: 'approve',
      resourceType: 'review',
      resourceId: reviewId,
      details: { productId: review.product },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(updatedReview);
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ error: 'Failed to approve review' });
  }
});

// Reject a review
router.patch('/:id/reject', withAdminAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await storage.getReview(reviewId);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const updatedReview = await storage.updateReview(reviewId, {
      isApproved: false,
      status: 'rejected',
    });
    
    // Log activity
    await storage.logActivity({
      user: req.session.user.id,
      action: 'reject',
      resourceType: 'review',
      resourceId: reviewId,
      details: { productId: review.product },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(updatedReview);
  } catch (error) {
    console.error('Error rejecting review:', error);
    res.status(500).json({ error: 'Failed to reject review' });
  }
});

// Reply to a review
router.post('/:id/reply', withAdminAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await storage.getReview(reviewId);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const replyData = insertAdminReplySchema.parse({
      text: req.body.replyText,
      adminUser: req.session.user.id,
    });
    
    const updatedReview = await storage.addReviewReply(reviewId, {
      text: replyData.text,
      date: new Date(),
      adminUser: replyData.adminUser,
    });
    
    // Log activity
    await storage.logActivity({
      user: req.session.user.id,
      action: 'reply',
      resourceType: 'review',
      resourceId: reviewId,
      details: { productId: review.product },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(updatedReview);
  } catch (error) {
    console.error('Error replying to review:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to reply to review' });
  }
});

// Delete a review
router.delete('/:id', withAdminAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await storage.getReview(reviewId);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const productId = review.product.toString();
    
    await storage.deleteReview(reviewId);
    
    // Update the product's rating
    await storage.updateProductRating(productId);
    
    // Log activity
    await storage.logActivity({
      user: req.session.user.id,
      action: 'delete',
      resourceType: 'review',
      resourceId: reviewId,
      details: { productId },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;