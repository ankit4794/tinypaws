import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '@/server/storage';
import { withAdminAuth } from '@/middleware/admin-auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get dashboard statistics
    const products = await storage.getProducts();
    
    // Check if these optional methods exist in the storage implementation
    const allOrders = storage.getAllOrders ? await storage.getAllOrders() : [];
    const users = storage.getAllUsers ? await storage.getAllUsers() : [];

    // Get only the most recent 5 orders
    const recentOrders = allOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return res.status(200).json({
      totalProducts: products.length,
      totalOrders: allOrders.length,
      totalUsers: users.length,
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
}

export default withAdminAuth(handler);