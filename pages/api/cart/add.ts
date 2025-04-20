import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db-connect';
import { CartItem, Product } from '@/models';
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
    const { productId, quantity, weight, pack, variant } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'You must be logged in to add items to your cart' });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is already in cart with same options
    const existingCartItem = await CartItem.findOne({
      userId,
      productId,
      weight: weight || { $exists: false },
      pack: pack || { $exists: false },
      variant: variant || { $exists: false },
    });

    let cartItem;
    
    if (existingCartItem) {
      // Update quantity
      existingCartItem.quantity += quantity;
      
      // Check if product has inventory limits
      const maxQuantity = product.inventory?.quantity || 999;
      if (existingCartItem.quantity > maxQuantity) {
        existingCartItem.quantity = maxQuantity;
      }
      
      cartItem = await existingCartItem.save();
    } else {
      // Create new cart item
      cartItem = await CartItem.create({
        userId,
        productId,
        quantity,
        weight,
        pack,
        variant,
      });
    }

    // Populate product info for response
    await cartItem.populate('productId', 'name slug image price salePrice inventory');
    
    const formattedItem = {
      _id: cartItem._id.toString(),
      productId: cartItem.productId._id.toString(),
      name: cartItem.productId.name,
      slug: cartItem.productId.slug,
      image: cartItem.productId.image,
      price: cartItem.productId.price,
      salePrice: cartItem.productId.salePrice,
      quantity: cartItem.quantity,
      weight: cartItem.weight,
      pack: cartItem.pack,
      variant: cartItem.variant,
      maxQuantity: cartItem.productId.inventory?.quantity || 999,
    };

    return res.status(200).json(formattedItem);
  } catch (error) {
    console.error('Add to cart API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}