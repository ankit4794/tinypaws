import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Return user data (without password)
    return res.status(200).json(req.session.user);
  } catch (error) {
    console.error('Error getting user data:', error);
    return res.status(500).json({ message: 'Failed to get user data' });
  }
}