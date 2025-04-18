import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Express } from 'express';
import session from 'express-session';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { storage } from './storage';
import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'tinypaws-secret-key-123',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  app.set('trust proxy', 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || undefined);
    } catch (error) {
      done(error);
    }
  });

  // Register a new user
  app.post('/api/register', async (req, res, next) => {
    try {
      const { username, email, password, fullName } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByUsername(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Create new user
      const user = await storage.createUser({
        username,
        email,
        password: await hashPassword(password),
        fullName: fullName || null,
        role: 'USER', // Default role
        address: null,
        mobile: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Log in the new user automatically
      req.login(user, (err) => {
        if (err) return next(err);
        // Return user data without password
        const { password, ...userData } = user;
        return res.status(201).json(userData);
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Admin registration
  app.post('/api/admin/register', async (req, res, next) => {
    try {
      // Check if the request comes from an admin
      if (!req.isAuthenticated() || req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { username, email, password, fullName } = req.body;

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Create new admin user
      const user = await storage.createUser({
        username,
        email,
        password: await hashPassword(password),
        fullName: fullName || null,
        role: 'ADMIN', // Admin role
        address: null,
        mobile: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Return created admin without password
      const { password: _, ...userData } = user;
      return res.status(201).json(userData);
    } catch (error) {
      console.error('Admin registration error:', error);
      res.status(500).json({ error: 'Admin registration failed' });
    }
  });

  // Login endpoint
  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user data without password
        const { password, ...userData } = user;
        return res.status(200).json(userData);
      });
    })(req, res, next);
  });

  // Admin login endpoint
  app.post('/api/admin/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      // Check if user has admin role
      if (user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user data without password
        const { password, ...userData } = user;
        return res.status(200).json(userData);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  // Get current user
  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Return user data without password
    const { password, ...userData } = req.user;
    res.json(userData);
  });

  // Update user profile
  app.put('/api/user', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const userId = req.user.id;
      const { fullName, email, mobile, address } = req.body;
      
      // Update user data
      const updatedUser = await storage.updateUser(userId, {
        fullName,
        email,
        mobile,
        address,
        updatedAt: new Date()
      });
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Return updated user without password
      const { password, ...userData } = updatedUser;
      res.json(userData);
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Profile update failed' });
    }
  });

  // Change password
  app.post('/api/user/change-password', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }
      
      // Get current user data
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verify current password
      if (!(await comparePasswords(currentPassword, user.password))) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      // Update password
      const updatedUser = await storage.updateUser(userId, {
        password: await hashPassword(newPassword),
        updatedAt: new Date()
      });
      
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ error: 'Password change failed' });
    }
  });

  // Middleware to check if user is authenticated
  app.use('/api/admin/*', (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });

  // For testing only: Create initial admin if none exists
  if (process.env.NODE_ENV !== 'production') {
    createInitialAdminIfNeeded();
  }
}

// Create initial admin user if none exists
async function createInitialAdminIfNeeded() {
  try {
    // Check if any admin exists
    const existingAdmin = await storage.getUserByUsername('admin');
    
    if (!existingAdmin) {
      console.log('Creating initial admin user...');
      
      await storage.createUser({
        username: 'admin',
        email: 'admin@tinypaws.com',
        password: await hashPassword('admin123'),
        fullName: 'System Administrator',
        role: 'ADMIN',
        address: null,
        mobile: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log('Initial admin created successfully');
    }
  } catch (error) {
    console.error('Error creating initial admin:', error);
  }
}