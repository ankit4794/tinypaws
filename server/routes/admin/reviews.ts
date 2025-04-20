import { Router } from 'express';
import { withAdminAuth } from '../../../middleware/admin-auth';
import { Review } from '../../models';
import mongoose from 'mongoose';

const router = Router();

// Get all reviews (paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Get product filters if any
    const productId = req.query.product;
    const statusFilter = req.query.status;
    const ratingFilter = req.query.rating ? parseInt(req.query.rating as string) : null;

    // Build filter object
    const filter: any = {};
    if (productId) filter.product = productId;
    if (statusFilter) filter.status = statusFilter;
    if (ratingFilter) filter.rating = ratingFilter;

    // Count total documents with the filter
    const total = await Review.countDocuments(filter);
    
    // Get reviews with pagination
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'fullName email username')
      .populate('product', 'name slug images')
      .lean();
    
    const totalPages = Math.ceil(total / limit);
    
    // Return paginated results
    res.json({
      reviews,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get a single review by ID
router.get('/:id', withAdminAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }
    
    const review = await Review.findById(reviewId)
      .populate('user', 'fullName email username')
      .populate('product', 'name slug images')
      .lean();
      
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
router.patch('/approve/:id', withAdminAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }
    
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { 
        status: 'approved',
        isApproved: true,
        adminReply: req.body.adminReply ? {
          text: req.body.adminReply,
          date: new Date(),
          adminUser: req.session.user.id
        } : undefined
      },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Return updated review
    res.json({ success: true, id: reviewId, status: 'approved', review });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ error: 'Failed to approve review' });
  }
});

// Reject a review
router.patch('/reject/:id', withAdminAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }
    
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { 
        status: 'rejected',
        isApproved: false,
        adminReply: req.body.adminReply ? {
          text: req.body.adminReply,
          date: new Date(),
          adminUser: req.session.user.id
        } : undefined
      },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Return updated review
    res.json({ success: true, id: reviewId, status: 'rejected', review });
  } catch (error) {
    console.error('Error rejecting review:', error);
    res.status(500).json({ error: 'Failed to reject review' });
  }
});

// Delete a review
router.delete('/:id', withAdminAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Get the product to update its review count and rating
    const product = await review.populate('product');
    
    // Delete the review
    await Review.findByIdAndDelete(reviewId);
    
    // Return success
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;