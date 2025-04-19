import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '@/server/storage';
import { withAdminAuth } from '@/middleware/admin-auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - Get all orders with pagination and filtering
  if (req.method === 'GET') {
    try {
      // Check if getAllOrders method exists in the storage implementation
      if (!storage.getAllOrders) {
        return res.status(501).json({ message: 'getAllOrders method not implemented in the storage' });
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string || '';
      
      // Get all orders
      let orders = await storage.getAllOrders();
      
      // Apply status filter if provided
      if (status) {
        orders = orders.filter(order => order.status === status);
      }
      
      // Sort orders by createdAt date (newest first)
      orders = orders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Calculate pagination
      const totalItems = orders.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      // Get paginated orders
      const paginatedOrders = orders.slice(startIndex, endIndex);
      
      return res.status(200).json({
        orders: paginatedOrders,
        totalPages,
        currentPage: page,
        totalItems
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ message: 'Failed to fetch orders' });
    }
  }
  
  // Method not allowed
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withAdminAuth(handler);