import type { NextApiRequest, NextApiResponse } from 'next';
import { isAuthenticated } from '../../lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if user is authenticated using our auth middleware
    const user = await isAuthenticated(req, res);
    
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}