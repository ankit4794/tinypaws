import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if req.logout exists and is a function
  if (req.logout && typeof req.logout === 'function') {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Failed to logout' });
      }
      
      res.status(200).json({ message: 'Logged out successfully' });
    });
  } else {
    // If req.logout is not available, just return success
    // This handles edge cases where the session might already be destroyed
    res.status(200).json({ message: 'Logged out successfully' });
  }
}