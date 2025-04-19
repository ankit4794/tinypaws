import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '@/server/storage';
import { withAdminAuth } from '@/middleware/admin-auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - Get all users with pagination and search
  if (req.method === 'GET') {
    try {
      // Check if getAllUsers method exists in the storage implementation
      if (!storage.getAllUsers) {
        return res.status(501).json({ message: 'getAllUsers method not implemented in the storage' });
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      
      // Get all users
      let users = await storage.getAllUsers();
      
      // Apply search filter if search term is provided
      if (search) {
        users = users.filter(user => 
          user.username.toLowerCase().includes(search.toLowerCase()) || 
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          (user.fullName && user.fullName.toLowerCase().includes(search.toLowerCase()))
        );
      }
      
      // Sort users by createdAt date (newest first)
      users = users.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Calculate pagination
      const totalItems = users.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      // Get paginated users
      const paginatedUsers = users.slice(startIndex, endIndex);
      
      // Remove sensitive information from the user objects
      const sanitizedUsers = paginatedUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return res.status(200).json({
        users: sanitizedUsers,
        totalPages,
        currentPage: page,
        totalItems
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
  }
  
  // Method not allowed
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withAdminAuth(handler);