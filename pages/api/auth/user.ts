import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/db-connect';
import { User } from '@/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if the user is authenticated by looking at the session
  // @ts-ignore - session property exists on req when using passport/express-session
  const userId = req.session?.passport?.user;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    await connectToDatabase();
    
    // Fetch the user by ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Convert to plain object and remove sensitive fields
    const userData = user.toObject();
    delete userData.password;
    
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
}