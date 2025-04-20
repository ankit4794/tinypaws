import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db-connect';
import { WishlistItem, Product } from '@/models';
import { isAuthenticated } from '@/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  // Check if user is authenticated
  const user = await isAuthenticated(req, res, false);
  const userId = user?._id;

  try {
    switch (req.method) {
      case 'GET':
        // Get user's wishlist
        if (!userId) {
          return res.status(401).json({ message: 'You must be logged in to view your wishlist' });
        }
        
        const wishlistItems = await WishlistItem.find({ userId })
          .populate('productId', 'name slug image price salePrice inventory')
          .sort({ createdAt: -1 });
        
        // Map to add product info directly to wishlist items
        const formattedItems = wishlistItems.map(item => {
          const product = item.productId;
          
          return {
            _id: item._id.toString(),
            productId: product._id.toString(),
            name: product.name,
            slug: product.slug,
            image: product.image,
            price: product.price,
            salePrice: product.salePrice,
            addedAt: item.createdAt.toISOString(),
            inStock: product.inventory?.inStock !== false && 
                     (product.inventory?.quantity === undefined || product.inventory?.quantity > 0),
          };
        });
        
        return res.status(200).json({ items: formattedItems });
        
      case 'DELETE':
        // Clear user's wishlist
        if (!userId) {
          return res.status(401).json({ message: 'You must be logged in to clear your wishlist' });
        }
        
        await WishlistItem.deleteMany({ userId });
        return res.status(200).json({ message: 'Wishlist cleared successfully' });
        
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Wishlist API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}