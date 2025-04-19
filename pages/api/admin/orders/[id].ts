import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '@/server/storage';
import { withAdminAuth } from '@/middleware/admin-auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid order ID' });
  }

  // GET - Get a single order with detailed information
  if (req.method === 'GET') {
    try {
      // Since we need a detailed view, we use storage methods differently
      // First get all orders to find the one we need
      if (!storage.getAllOrders) {
        return res.status(501).json({ message: 'getAllOrders method not implemented in the storage' });
      }
      
      const allOrders = await storage.getAllOrders();
      const order = allOrders.find(o => o.id.toString() === id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Get the user information
      const user = await storage.getUser(order.userId);
      
      // Get order items if possible
      // For simplicity, we'll use the order's items if they exist
      let orderWithItems = order;
      if (storage.getOrderDetails) {
        // Use the storage's getOrderDetails method if available
        const orderDetails = await storage.getOrderDetails(order.userId, id);
        if (orderDetails) {
          orderWithItems = orderDetails;
        }
      }
      
      // Combine data for a detailed response
      const response = {
        ...orderWithItems,
        user: user ? {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName
        } : null
      };
      
      return res.status(200).json(response);
    } catch (error) {
      console.error(`Error fetching order with ID ${id}:`, error);
      return res.status(500).json({ message: 'Failed to fetch order' });
    }
  }
  
  // PUT - Update order status
  else if (req.method === 'PUT') {
    try {
      if (!storage.updateOrderStatus) {
        return res.status(501).json({ message: 'updateOrderStatus method not implemented in the storage' });
      }
      
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }
      
      // Update the order status
      const updatedOrder = await storage.updateOrderStatus(id, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error(`Error updating order with ID ${id}:`, error);
      return res.status(500).json({ message: 'Failed to update order' });
    }
  }
  
  // Method not allowed
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withAdminAuth(handler);