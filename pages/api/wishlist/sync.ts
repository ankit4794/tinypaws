import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db-connect';
import { WishlistItem, Product } from '@/models';
import { isAuthenticated } from '@/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  // Check if user is authenticated
  const user = await isAuthenticated(req, res, true);
  const userId = user._id;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items must be an array' });
    }

    // Process each item in the array
    for (const item of items) {
      const { productId } = item;
      
      if (!productId) {
        continue; // Skip invalid items
      }

      // Verify product exists
      const product = await Product.findById(productId);
      if (!product) {
        continue; // Skip non-existent products
      }

      // Check if product is already in wishlist
      const existingItem = await WishlistItem.findOne({
        userId,
        productId,
      });

      if (!existingItem) {
        // Only add if not already in wishlist
        await WishlistItem.create({
          userId,
          productId,
        });
      }
    }

    // Return the updated wishlist
    const updatedWishlist = await WishlistItem.find({ userId })
      .populate('productId', 'name slug image price salePrice inventory')
      .sort({ createdAt: -1 });
    
    // Map to add product info directly to wishlist items
    const formattedItems = updatedWishlist.map(item => {
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
  } catch (error) {
    console.error('Sync wishlist API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}