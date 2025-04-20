import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db-connect';
import { Order } from '@/models';
import { isAdmin } from '@/middleware/auth';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  // Ensure the requester is an admin
  await isAdmin(req, res);
  
  const { id } = req.query;
  
  // Validate the ID
  if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ message: 'Invalid order ID' });
  }
  
  try {
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
    
    switch (req.method) {
      case 'GET':
        // Return the order
        return res.status(200).json(order);
        
      case 'PATCH':
        // Update order details
        const {
          status,
          trackingNumber,
          courier,
          notes,
          paymentStatus
        } = req.body;
        
        // Update fields if provided
        if (status) order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (courier) order.courier = courier;
        if (notes !== undefined) order.notes = notes;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        
        await order.save();
        
        return res.status(200).json({
          message: 'Order updated successfully',
          order
        });
        
      case 'DELETE':
        // Delete order (rarely used, usually we keep records)
        await Order.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Order deleted successfully' });
        
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin order API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}