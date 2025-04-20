import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db-connect';
import { WishlistItem } from '@/models';
import { isAuthenticated } from '@/middleware/auth';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  // Check if user is authenticated
  const user = await isAuthenticated(req, res, false);
  const userId = user?._id;

  if (!userId) {
    return res.status(401).json({ message: 'You must be logged in to perform this action' });
  }

  const { id } = req.query;
  
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if ID is a product ID or wishlist item ID
    if (mongoose.Types.ObjectId.isValid(id as string)) {
      // First try to find by wishlist item ID
      let deleted = await WishlistItem.deleteOne({ 
        _id: id,
        userId
      });

      // If no records were deleted, try by product ID
      if (deleted.deletedCount === 0) {
        deleted = await WishlistItem.deleteOne({
          productId: id,
          userId
        });
      }

      if (deleted.deletedCount === 0) {
        return res.status(404).json({ message: 'Wishlist item not found' });
      }

      return res.status(200).json({ message: 'Item removed from wishlist successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
  } catch (error) {
    console.error('Wishlist delete API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}