import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '@/server/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if user is authenticated
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get fresh user data in case it was updated
    const freshUser = await storage.getUser(req.session.user.id);
    
    if (!freshUser) {
      // User was deleted or doesn't exist anymore
      req.session.destroy();
      return res.status(401).json({ message: 'User not found' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = freshUser;

    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error getting user:', error);
    return res.status(500).json({ message: 'Failed to get user information' });
  }
}