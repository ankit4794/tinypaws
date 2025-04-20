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
    console.log(`Admin login attempt for email: ${email}`);
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find admin user by email
    const user = await storageProvider.instance.getUserByEmail(email);
    
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log(`User found with role: ${user.role}`);
    
    // Check if user has admin role
    if (user.role !== 'ADMIN') {
      console.log(`User ${email} has no admin role: ${user.role}`);
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);
    
    if (!isPasswordValid) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log(`Password valid for: ${email}, attempting to login with Passport`);
    
    // Convert mongoose document to a plain object before login
    const userObj = typeof user.toObject === 'function' ? user.toObject() : user;
    
    // Create a simplified user object to avoid serialization issues
    const safeUser = {
      id: userObj._id || userObj.id,
      _id: userObj._id || userObj.id, // Include both formats for compatibility
      email: userObj.email,
      username: userObj.username || userObj.email,
      fullName: userObj.fullName,
      role: userObj.role
    };
    
    // Login the user using Passport
    req.login(safeUser, (err) => {
      if (err) {
        console.error(`Login error in req.login: ${err.message}`);
        return res.status(500).json({ error: `Login failed: ${err.message}` });
      }
      
      console.log(`Admin login successful for: ${email}`);
      res.status(200).json(safeUser);
    });
  } catch (error) {
    console.error('Admin login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: `Internal server error: ${errorMessage}` });
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