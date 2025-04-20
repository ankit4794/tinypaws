import express from 'express';
import { Request, Response } from 'express';
import { comparePasswords } from '../../auth';
import { storageProvider } from '../../index';
import { requireAdmin } from '../../middleware/admin-auth';

const router = express.Router();

// Admin login route
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find admin user by email
    const user = await storageProvider.instance.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if user has admin role
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Login the user using Passport
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }
      
      // Return user info without sensitive data
      const userObj = typeof user.toObject === 'function' ? user.toObject() : user;
      // Remove password from response
      const { password, ...userWithoutPassword } = userObj;
      res.status(200).json(userWithoutPassword);
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin logout route
router.post('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// Get current admin user
router.get('/user', requireAdmin, (req: Request, res: Response) => {
  // If we reach here, the requireAdmin middleware has already verified the user
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const userObj = typeof req.user.toObject === 'function' 
    ? req.user.toObject() 
    : req.user;
    
  // Remove password from response
  const { password, ...userWithoutPassword } = userObj;
  res.status(200).json(userWithoutPassword);
});

export default router;