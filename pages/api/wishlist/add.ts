import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db-connect';
import { WishlistItem, Product } from '@/models';
import { isAuthenticated } from '@/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  // Check if user is authenticated
  const user = await isAuthenticated(req, res, false);
  const userId = user?._id;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'You must be logged in to add items to your wishlist' });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is already in wishlist
    const existingItem = await WishlistItem.findOne({
      userId,
      productId,
    });

    if (existingItem) {
      // Product already in wishlist, just return it
      return res.status(200).json({
        _id: existingItem._id.toString(),
        productId: product._id.toString(),
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: product.price,
        salePrice: product.salePrice,
        addedAt: existingItem.createdAt.toISOString(),
        inStock: product.inventory?.inStock !== false && 
                 (product.inventory?.quantity === undefined || product.inventory?.quantity > 0),
      });
    }

    // Create new wishlist item
    const wishlistItem = await WishlistItem.create({
      userId,
      productId,
    });

    // Format response
    const formattedItem = {
      _id: wishlistItem._id.toString(),
      productId: product._id.toString(),
      name: product.name,
      slug: product.slug,
      image: product.image,
      price: product.price,
      salePrice: product.salePrice,
      addedAt: wishlistItem.createdAt.toISOString(),
      inStock: product.inventory?.inStock !== false && 
               (product.inventory?.quantity === undefined || product.inventory?.quantity > 0),
    };

    return res.status(201).json(formattedItem);
  } catch (error) {
    console.error('Add to wishlist API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}