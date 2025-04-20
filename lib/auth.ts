import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { User } from '@/models';
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from './db-connect';
import mongoose from 'mongoose';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export type AuthUser = {
  _id: string;
  email: string;
  fullName?: string;
  role: string;
  [key: string]: any;
};

/**
 * Checks if the user is authenticated. Returns the user if authenticated.
 * Responds with 401 if not authenticated.
 */
export async function isAuthenticated(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthUser | null> {
  // Use session data if present
  const session = (req as any).session;
  const userId = session?.passport?.user;

  if (!userId) {
    return null;
  }

  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    
    if (!user) {
      return null;
    }
    
    // Convert to plain object and remove sensitive data
    const userData = user.toObject();
    delete userData.password;
    
    return userData as AuthUser;
  } catch (error) {
    console.error('Error in isAuthenticated:', error);
    return null;
  }
}

/**
 * Middleware function to check if a user is authenticated.
 * If not, it will return a 401 response.
 */
export async function authMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (req: NextApiRequest, res: NextApiResponse, user: AuthUser) => Promise<void>
): Promise<void> {
  const user = await isAuthenticated(req, res);
  
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  return handler(req, res, user);
}

/**
 * Middleware function to check if a user is an admin.
 * If not, it will return a 403 response.
 */
export async function adminMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (req: NextApiRequest, res: NextApiResponse, user: AuthUser) => Promise<void>
): Promise<void> {
  const user = await isAuthenticated(req, res);
  
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }
  
  return handler(req, res, user);
}

/**
 * Creates the initial admin user if it doesn't exist
 */
export async function createInitialAdminIfNeeded(): Promise<void> {
  try {
    await connectToDatabase();
    
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      console.log('Creating initial admin user...');
      
      const adminUser = new User({
        email: 'admin@tinypaws.com',
        username: 'admin',
        password: await hashPassword('admin123'),
        fullName: 'Admin User',
        role: 'admin',
      });
      
      await adminUser.save();
      console.log('Initial admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating initial admin user:', error);
  }
}