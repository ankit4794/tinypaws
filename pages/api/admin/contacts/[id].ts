import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '@/server/storage';
import { withAdminAuth } from '@/middleware/admin-auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid contact submission ID' });
  }

  // PUT - Update contact submission resolved status
  if (req.method === 'PUT') {
    try {
      // Check if method exists in the storage implementation
      if (!storage.updateContactSubmissionStatus) {
        return res.status(501).json({ message: 'updateContactSubmissionStatus method not implemented in the storage' });
      }
      
      const { isResolved } = req.body;
      
      if (isResolved === undefined) {
        return res.status(400).json({ message: 'isResolved status is required' });
      }
      
      // Update the contact submission
      const updatedSubmission = await storage.updateContactSubmissionStatus(id, isResolved);
      
      if (!updatedSubmission) {
        return res.status(404).json({ message: 'Contact submission not found' });
      }
      
      return res.status(200).json(updatedSubmission);
    } catch (error) {
      console.error(`Error updating contact submission with ID ${id}:`, error);
      return res.status(500).json({ message: 'Failed to update contact submission' });
    }
  }
  
  // Method not allowed
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withAdminAuth(handler);