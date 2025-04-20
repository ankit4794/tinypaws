import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@/models';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface AuthUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  [key: string]: any;
}

// Middleware to authenticate users
export async function isAuthenticated(
  req: NextApiRequest,
  res: NextApiResponse,
  required = true
): Promise<AuthUser | null> {
  try {
    // Get session from next-auth
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      if (required) {
        res.status(401).json({ message: 'You must be logged in to perform this action' });
        throw new Error('Authentication required');
      } else {
        return null;
      }
    }
    
    // Get user from database to ensure they still exist and get the latest data
    const userId = (session.user as any).id || (session.user as any)._id;
    const user = await User.findById(userId);
    
    if (!user) {
      if (required) {
        res.status(401).json({ message: 'User not found' });
        throw new Error('User not found');
      } else {
        return null;
      }
    }
    
    return user;
  } catch (error) {
    if (required) {
      throw error;
    }
    return null;
  }
}

// Middleware to verify admin role
export async function isAdmin(req: NextApiRequest, res: NextApiResponse): Promise<AuthUser> {
  const user = await isAuthenticated(req, res, true);
  
  if (user?.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    throw new Error('Admin access required');
  }
  
  return user;
}