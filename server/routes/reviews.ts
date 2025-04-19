import { Router } from 'express';
import { storage } from '../storage';
import { insertReviewSchema } from '../../shared/schema';

const router = Router();

// Get approved reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;
    
    // Only return approved reviews for public consumption
    const filters = {
      product: productId,
      isApproved: true,
      status: 'approved',
    };
    
    const [reviews, total] = await Promise.all([
      storage.getReviews(skip, limit, filters),
      storage.getReviewsCount(filters),
    ]);
    
    res.json({
      reviews,
      total,
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({ error: 'Failed to fetch product reviews' });
  }
});

// Get rating summary for a product
router.get('/product/:productId/summary', async (req, res) => {
  try {
    const productId = req.params.productId;
    const summary = await storage.getProductReviewSummary(productId);
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching product review summary:', error);
    res.status(500).json({ error: 'Failed to fetch product review summary' });
  }
});

// Submit a new review
router.post('/', async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'You must be logged in to submit a review' });
    }
    
    const userId = req.user.id;
    const reviewData = insertReviewSchema.parse({
      ...req.body,
      user: userId,
    });
    
    // Check if the user has already reviewed this product
    const existingReview = await storage.getUserProductReview(userId, reviewData.product);
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }
    
    // Check if this is a verified purchase
    const isVerifiedPurchase = await storage.hasUserPurchasedProduct(userId, reviewData.product);
    
    // By default, reviews are pending approval
    const review = await storage.createReview({
      ...reviewData,
      isVerifiedPurchase,
      isApproved: false,
      status: 'pending',
    });
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error submitting review:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Mark a review as helpful or not helpful
router.post('/:id/helpful', async (req, res) => {
  try {
    const reviewId = req.params.id;
    const isHelpful = req.body.isHelpful === true;
    
    const review = await storage.updateReviewHelpfulness(reviewId, isHelpful);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    console.error('Error marking review helpfulness:', error);
    res.status(500).json({ error: 'Failed to mark review helpfulness' });
  }
});

// Get all reviews by a specific user
router.get('/user', async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'You must be logged in to view your reviews' });
    }
    
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      storage.getUserReviews(userId, skip, limit),
      storage.getUserReviewsCount(userId),
    ]);
    
    res.json({
      reviews,
      total,
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Failed to fetch user reviews' });
  }
});

export default router;