import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db-connect';
import { CartItem, Product } from '@/models';
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
  
  // Validate the ID
  if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ message: 'Invalid item ID' });
  }

  try {
    // Find the cart item and ensure it belongs to the user
    const cartItem = await CartItem.findOne({ 
      _id: id,
      userId
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    switch (req.method) {
      case 'PATCH':
        // Update cart item quantity
        const { quantity } = req.body;
        
        if (typeof quantity !== 'number' || quantity < 1) {
          return res.status(400).json({ message: 'Quantity must be a positive number' });
        }
        
        // Get product to check inventory
        const product = await Product.findById(cartItem.productId);
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
        
        // Check if product has inventory limits
        const maxQuantity = product.inventory?.quantity || 999;
        cartItem.quantity = Math.min(quantity, maxQuantity);
        
        await cartItem.save();
        
        return res.status(200).json({ 
          _id: cartItem._id,
          quantity: cartItem.quantity,
          message: 'Cart item updated successfully' 
        });

      case 'DELETE':
        // Delete cart item
        await CartItem.deleteOne({ _id: id, userId });
        return res.status(200).json({ message: 'Cart item removed successfully' });

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Cart item API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}