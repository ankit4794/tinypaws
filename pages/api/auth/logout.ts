import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // @ts-ignore - req.logout is provided by passport
    if (req.logout) {
      req.logout((err: Error) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ error: 'Failed to logout' });
        }
        
        res.status(200).json({ message: 'Logged out successfully' });
      });
    } else {
      // Use session manually if req.logout is not available
      // @ts-ignore - session is available
      if (req.session) {
        // @ts-ignore - session is available
        req.session.destroy((err: Error) => {
          if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Failed to logout' });
          }
          
          res.status(200).json({ message: 'Logged out successfully' });
        });
      } else {
        res.status(200).json({ message: 'Logged out successfully' });
      }
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
}