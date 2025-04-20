import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db-connect';
import { CartItem, Product } from '@/models';
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
      const { productId, quantity, weight, pack, variant } = item;
      
      if (!productId || !quantity) {
        continue; // Skip invalid items
      }

      // Verify product exists
      const product = await Product.findById(productId);
      if (!product) {
        continue; // Skip non-existent products
      }

      // Check if product is already in cart with same options
      const existingCartItem = await CartItem.findOne({
        userId,
        productId,
        weight: weight || { $exists: false },
        pack: pack || { $exists: false },
        variant: variant || { $exists: false },
      });

      if (existingCartItem) {
        // Update quantity - take the max of current and synced quantity
        existingCartItem.quantity = Math.max(existingCartItem.quantity, quantity);
        
        // Check if product has inventory limits
        const maxQuantity = product.inventory?.quantity || 999;
        if (existingCartItem.quantity > maxQuantity) {
          existingCartItem.quantity = maxQuantity;
        }
        
        await existingCartItem.save();
      } else {
        // Create new cart item
        await CartItem.create({
          userId,
          productId,
          quantity,
          weight,
          pack,
          variant,
        });
      }
    }

    // Return the updated cart
    const updatedCart = await CartItem.find({ userId })
      .populate('productId', 'name slug image price salePrice inventory')
      .sort({ createdAt: -1 });
    
    // Map to add product info directly to cart items
    const formattedItems = updatedCart.map(item => {
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
  } catch (error) {
    console.error('Sync cart API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}