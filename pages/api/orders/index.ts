import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db-connect';
import { Order, OrderItem, CartItem, Product } from '@/models';
import { isAuthenticated } from '@/middleware/auth';

// Generate a random order number
function generateOrderNumber() {
  const prefix = 'TP';
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  try {
    switch (req.method) {
      case 'GET':
        // Get user's orders - requires authentication
        const userGet = await isAuthenticated(req, res, true);
        const userId = userGet._id;
        
        const orders = await Order.find({ userId })
          .sort({ createdAt: -1 })
          .populate({
            path: 'items.productId',
            select: 'name slug image'
          });
        
        return res.status(200).json(orders);
        
      case 'POST':
        // Place a new order - requires authentication
        const userPost = await isAuthenticated(req, res, true);
        
        // Extract order details from request body
        const {
          fullName,
          email,
          mobile,
          address,
          city,
          state,
          pincode,
          items,
          subtotal,
          deliveryCharge,
          tax,
          total,
          paymentMethod,
          deliveryInstructions
        } = req.body;
        
        // Validate required fields
        if (!fullName || !email || !mobile || !address || !city || !state || !pincode || !items || !Array.isArray(items)) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Create order with a generated order number
        const order = new Order({
          orderNumber: generateOrderNumber(),
          userId: userPost._id,
          fullName,
          email,
          mobile,
          address,
          city,
          state,
          pincode,
          subtotal: subtotal || 0,
          deliveryCharge: deliveryCharge || 0,
          tax: tax || 0,
          total: total || 0,
          paymentMethod: paymentMethod || 'cod',
          status: 'placed',
          deliveryInstructions,
        });
        
        // Create order items
        const orderItems = [];
        
        for (const item of items) {
          const { productId, quantity, price, weight, pack, variant } = item;
          
          if (!productId || !quantity) {
            continue; // Skip invalid items
          }
          
          // Verify product exists
          const product = await Product.findById(productId);
          if (!product) {
            continue; // Skip non-existent products
          }
          
          const orderItem = new OrderItem({
            orderId: order._id,
            productId,
            quantity,
            price: price || product.salePrice || product.price,
            weight,
            pack,
            variant,
          });
          
          await orderItem.save();
          orderItems.push(orderItem);
          
          // Update product inventory if tracking is enabled
          if (product.inventory && typeof product.inventory.quantity === 'number') {
            product.inventory.quantity = Math.max(0, product.inventory.quantity - quantity);
            
            if (product.inventory.quantity === 0) {
              product.inventory.inStock = false;
            }
            
            await product.save();
          }
        }
        
        // Add the order items to the order
        order.items = orderItems;
        await order.save();
        
        // Clear the user's cart after successful order
        await CartItem.deleteMany({ userId: userPost._id });
        
        // Return the created order
        return res.status(201).json(order);
        
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Orders API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}