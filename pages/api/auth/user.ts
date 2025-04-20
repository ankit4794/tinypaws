import type { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return authMiddleware(req, res, async (req, res, user) => {
    // User is already fetched and authenticated by the middleware
    // Just return the user object that's provided by the middleware
    res.status(200).json(user);
  });
}