import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db-connect';
import { Order } from '@/models';
import { isAuthenticated } from '@/middleware/auth';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  try {
    const { id } = req.query;
    
    // Validate the ID
    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    
    switch (req.method) {
      case 'GET':
        // Get order details - requires authentication
        const userGet = await isAuthenticated(req, res, true);
        
        // Find the order
        const order = await Order.findById(id)
          .populate({
            path: 'items',
            populate: {
              path: 'productId',
              select: 'name slug image'
            }
          });
        
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
        
        // Verify the order belongs to the authenticated user or user is admin
        if (order.userId.toString() !== userGet._id.toString() && userGet.role !== 'admin') {
          return res.status(403).json({ message: 'Unauthorized access to this order' });
        }
        
        return res.status(200).json(order);
        
      case 'PATCH':
        // Update order - only available for updating status by customer (cancelling) or by admin
        const userPatch = await isAuthenticated(req, res, true);
        
        // Find the order
        const orderToUpdate = await Order.findById(id);
        
        if (!orderToUpdate) {
          return res.status(404).json({ message: 'Order not found' });
        }
        
        // If user is not admin, they can only cancel their own orders and only if order status is 'placed'
        if (userPatch.role !== 'admin') {
          // Verify the order belongs to the authenticated user
          if (orderToUpdate.userId.toString() !== userPatch._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized access to this order' });
          }
          
          // Regular users can only cancel orders, not change to other statuses
          if (req.body.status && req.body.status !== 'cancelled') {
            return res.status(403).json({ message: 'You can only cancel orders' });
          }
          
          // Can only cancel if current status is 'placed'
          if (orderToUpdate.status !== 'placed') {
            return res.status(400).json({ message: 'This order cannot be cancelled anymore' });
          }
          
          // Update to cancelled
          orderToUpdate.status = 'cancelled';
          await orderToUpdate.save();
          
          return res.status(200).json({
            message: 'Order cancelled successfully',
            order: orderToUpdate
          });
        } else {
          // Admin can update any field
          const {
            status,
            trackingNumber,
            courier,
            notes
          } = req.body;
          
          if (status) orderToUpdate.status = status;
          if (trackingNumber) orderToUpdate.trackingNumber = trackingNumber;
          if (courier) orderToUpdate.courier = courier;
          if (notes !== undefined) orderToUpdate.notes = notes;
          
          await orderToUpdate.save();
          
          return res.status(200).json({
            message: 'Order updated successfully',
            order: orderToUpdate
          });
        }
        
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Order API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}