import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '@/server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if the user is authenticated and is an admin
    const user = req.session.user;
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get dashboard statistics
    const [products, allOrders, users] = await Promise.all([
      storage.getProducts(),
      storage.getAllOrders ? storage.getAllOrders() : [],
      storage.getAllUsers ? storage.getAllUsers() : []
    ]);

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