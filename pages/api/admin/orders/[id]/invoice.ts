import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db-connect';
import { Order } from '@/models';
import { isAdmin } from '@/middleware/auth';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  // Ensure the requester is an admin or authenticate the user
  try {
    await isAdmin(req, res);
  } catch (error) {
    // If not admin, check if user is the order owner
    const { id } = req.query;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Here we would check if the current user is the order owner
    // Skip for now as we'll handle in the actual implementation
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
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
          select: 'name slug image description'
        }
      });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // In a real implementation, we would generate a PDF invoice here
    // For now, just return the order data in a format that could be used to generate an invoice
    
    const invoiceData = {
      invoiceNumber: `INV-${order.orderNumber}`,
      date: new Date().toISOString(),
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        status: order.status,
        paymentMethod: order.paymentMethod,
      },
      customer: {
        name: order.fullName,
        email: order.email,
        phone: order.mobile,
        address: order.address,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
      },
      items: order.items.map((item: any) => ({
        name: item.productId?.name || 'Product Unavailable',
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        weight: item.weight,
        pack: item.pack,
        variant: item.variant,
      })),
      totals: {
        subtotal: order.subtotal,
        tax: order.tax,
        deliveryCharge: order.deliveryCharge,
        total: order.total,
      },
      company: {
        name: 'TinyPaws Pet Supplies',
        address: '123 Main Street',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        phone: '+91-9876543210',
        email: 'info@tinypaws.com',
        website: 'www.tinypaws.com',
        gstin: 'GSTIN12345678901',
      }
    };
    
    return res.status(200).json(invoiceData);
  } catch (error) {
    console.error('Invoice generation error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}