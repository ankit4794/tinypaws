import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db-connect';
import { CartItem, Product } from '@/models';
import { isAuthenticated } from '@/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  // Check if user is authenticated
  const user = await isAuthenticated(req, res, false);
  const userId = user?._id;

  try {
    switch (req.method) {
      case 'GET':
        // Get user's cart
        if (!userId) {
          return res.status(401).json({ message: 'You must be logged in to view your cart' });
        }
        
        const cartItems = await CartItem.find({ userId })
          .populate('productId', 'name slug image price salePrice inventory')
          .sort({ createdAt: -1 });
        
        // Map to add product info directly to cart items
        const formattedItems = cartItems.map(item => {
          const product = item.productId;
          
          return {
            _id: item._id.toString(),
            productId: product._id.toString(),
            name: product.name,
            slug: product.slug,
            image: product.image,
            price: product.price,
            salePrice: product.salePrice,
            quantity: item.quantity,
            weight: item.weight,
            pack: item.pack,
            variant: item.variant,
            maxQuantity: product.inventory?.quantity || 999,
          };
        });
        
        return res.status(200).json({ items: formattedItems });
        
      case 'DELETE':
        // Clear user's cart
        if (!userId) {
          return res.status(401).json({ message: 'You must be logged in to clear your cart' });
        }
        
        await CartItem.deleteMany({ userId });
        return res.status(200).json({ message: 'Cart cleared successfully' });
        
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Cart API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}