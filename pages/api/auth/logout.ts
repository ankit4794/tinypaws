import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Clear session
    req.session.destroy();

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error in logout:', error);
    return res.status(500).json({ message: 'Logout failed' });
  }
}