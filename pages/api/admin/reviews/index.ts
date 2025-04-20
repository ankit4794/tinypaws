import { NextApiRequest, NextApiResponse } from 'next';
import { Review, Product, User } from '@/models';
import mongoose from 'mongoose';
import { isAdmin } from '@/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify admin access
    try {
      await isAdmin(req, res);
    } catch (error) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Connect to MongoDB if needed
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URL!);
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return getReviews(req, res);
      case 'PUT':
        return updateReviewStatus(req, res);
      case 'DELETE':
        return deleteReview(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin reviews API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get all reviews with pagination and filtering
async function getReviews(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      product,
      user,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    let query: any = {};
    let sortOption: any = {};

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (product) {
      query.product = product;
    }
    if (user) {
      query.user = user;
    }

    // Set up sort options
    if (sort) {
      const sortOrder = order === 'asc' ? 1 : -1;
      sortOption[sort as string] = sortOrder;
    }

    // Count total reviews for pagination
    const totalCount = await Review.countDocuments(query);

    // Get reviews with pagination, populate product and user details
    const reviews = await Review.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('product', 'name slug images')
      .populate('user', 'username email fullName');

    return res.status(200).json({
      reviews,
      pagination: {
        total: totalCount,
        page: Number(page),
        pageSize: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ message: 'Failed to fetch reviews' });
  }
}

// Update review status (approve, reject)
async function updateReviewStatus(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { reviewId, status } = req.body;

    if (!reviewId || !status) {
      return res.status(400).json({ message: 'Review ID and status are required' });
    }

    // Check if status is valid
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved, rejected, or pending' });
    }

    // Update review status
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    ).populate('product', 'name slug');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // If status is approved, update product rating
    if (status === 'approved') {
      // Get all approved reviews for this product
      const productReviews = await Review.find({
        product: review.product._id,
        status: 'approved',
      });

      // Calculate average rating
      const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = productReviews.length > 0 ? totalRating / productReviews.length : 0;

      // Update product rating
      await Product.findByIdAndUpdate(review.product._id, {
        rating: parseFloat(averageRating.toFixed(1)),
        reviewCount: productReviews.length,
      });
    }

    return res.status(200).json(review);
  } catch (error) {
    console.error('Error updating review status:', error);
    return res.status(500).json({ message: 'Failed to update review status' });
  }
}

// Delete a review
async function deleteReview(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { reviewId } = req.body;

    if (!reviewId) {
      return res.status(400).json({ message: 'Review ID is required' });
    }

    // Get the review to check the product ID
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const productId = review.product;

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    // Update the product rating
    const productReviews = await Review.find({
      product: productId,
      status: 'approved',
    });

    // Calculate average rating
    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = productReviews.length > 0 ? totalRating / productReviews.length : 0;

    // Update product rating
    await Product.findByIdAndUpdate(productId, {
      rating: parseFloat(averageRating.toFixed(1)),
      reviewCount: productReviews.length,
    });

    return res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ message: 'Failed to delete review' });
  }
}