import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '@/server/storage';
import { withAdminAuth } from '@/middleware/admin-auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - Get all contact submissions with filtering
  if (req.method === 'GET') {
    try {
      // Check if method exists in the storage implementation
      if (!storage.getContactSubmissions) {
        return res.status(501).json({ message: 'getContactSubmissions method not implemented in the storage' });
      }
      
      const resolved = req.query.resolved ? req.query.resolved === 'true' : undefined;
      
      // Get contact submissions with filter
      const submissions = await storage.getContactSubmissions(resolved);
      
      return res.status(200).json(submissions);
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      return res.status(500).json({ message: 'Failed to fetch contact submissions' });
    }
  }
  
  // Method not allowed
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withAdminAuth(handler);