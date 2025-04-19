import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Express, Request } from 'express';
import session from 'express-session';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { storageProvider } from './index';
import { User, UserRole } from '@shared/schema';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import mailgun from 'mailgun-js';

// Initialize Twilio client for OTP (only if valid credentials are available)
let twilioClient: any = null;
if (process.env.TWILIO_ACCOUNT_SID?.startsWith('AC') && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('Twilio client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Twilio client:', error);
  }
}

// Initialize Mailgun for email notifications (only if valid credentials are available)
let mg: any = null;
if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
  try {
    mg = mailgun({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
    });
    console.log('Mailgun client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Mailgun client:', error);
  }
}

// JWT secret for OTP tokens
const JWT_SECRET = process.env.JWT_SECRET || 'tinypaws-jwt-secret-key-123';

declare global {
  namespace Express {
    // Define User interface with MongoDB document structure (_id instead of id)
    interface User {
      _id: string;
      username: string;
      email: string;
      password: string;
      fullName?: string | null;
      mobile?: string | null;
      address?: any | null;
      role: UserRole;
      googleId?: string;
      facebookId?: string;
      createdAt: Date;
      updatedAt: Date;
    }
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

// Generate a random OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via SMS
async function sendSMSOTP(phone: string, otp: string): Promise<boolean> {
  // Check if Twilio client is initialized
  if (!twilioClient) {
    console.error('Twilio client not initialized. Cannot send SMS OTP.');
    return false;
  }

  try {
    await twilioClient.messages.create({
      body: `Your TinyPaws verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    return true;
  } catch (error) {
    console.error('Error sending SMS OTP:', error);
    return false;
  }
}

// Send OTP via Email
async function sendEmailOTP(email: string, otp: string): Promise<boolean> {
  // Check if Mailgun client is initialized
  if (!mg) {
    console.error('Mailgun client not initialized. Cannot send Email OTP.');
    return false;
  }

  try {
    const data = {
      from: 'TinyPaws <no-reply@tinypaws.in>',
      to: email,
      subject: 'Your Verification Code',
      text: `Your TinyPaws verification code is: ${otp}`,
      html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
          <h2 style="color: #333;">TinyPaws Verification</h2>
          <p>Please use the following code to verify your account:</p>
          <div style="background-color: #f8f8f8; padding: 15px; border-radius: 4px; font-size: 24px; letter-spacing: 5px; text-align: center; font-weight: bold;">
            ${otp}
          </div>
          <p style="margin-top: 20px; font-size: 14px; color: #777;">This code will expire in 10 minutes.</p>
          <p style="font-size: 14px; color: #777;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    await mg.messages().send(data);
    return true;
  } catch (error) {
    console.error('Error sending Email OTP:', error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'tinypaws-secret-key-123',
    resave: false,
    saveUninitialized: false,
    store: storageProvider.instance.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  app.set('trust proxy', 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local authentication strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storageProvider.instance.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Google authentication strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: '/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await storageProvider.instance.getUserByUsername(profile.emails?.[0]?.value || '');
          
          // If user doesn't exist, create a new one
          if (!user) {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('No email found in Google profile'));
            }
            
            const randomPass = randomBytes(16).toString('hex');
            user = await storageProvider.instance.createUser({
              username: email,
              email: email,
              password: await hashPassword(randomPass),
              fullName: profile.displayName || null,
              role: UserRole.USER,
              address: null,
              mobile: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              googleId: profile.id
            });
          } 
          // If user exists but doesn't have googleId, update it
          else if (!user.googleId) {
            user = await storageProvider.instance.updateUser(user._id, {
              googleId: profile.id,
              updatedAt: new Date()
            });
          }
          
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Facebook authentication strategy
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID || '',
        clientSecret: process.env.FACEBOOK_APP_SECRET || '',
        callbackURL: '/auth/facebook/callback',
        profileFields: ['id', 'emails', 'name', 'displayName']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await storageProvider.instance.getUserByUsername(profile.emails?.[0]?.value || '');
          
          // If user doesn't exist, create a new one
          if (!user) {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('No email found in Facebook profile'));
            }
            
            const randomPass = randomBytes(16).toString('hex');
            user = await storageProvider.instance.createUser({
              username: email,
              email: email,
              password: await hashPassword(randomPass),
              fullName: profile.displayName || null,
              role: UserRole.USER,
              address: null,
              mobile: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              facebookId: profile.id
            });
          } 
          // If user exists but doesn't have facebookId, update it
          else if (!user.facebookId) {
            user = await storageProvider.instance.updateUser(user._id, {
              facebookId: profile.id,
              updatedAt: new Date()
            });
          }
          
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storageProvider.instance.getUser(id);
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
      const existingUser = await storageProvider.instance.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Check if email already exists
      const existingEmail = await storageProvider.instance.getUserByUsername(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Create new user
      const user = await storageProvider.instance.createUser({
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
      const existingUser = await storageProvider.instance.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Create new admin user
      const user = await storageProvider.instance.createUser({
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
      const userId = req.user._id;
      const { fullName, email, mobile, address } = req.body;
      
      // Update user data
      const updatedUser = await storageProvider.instance.updateUser(userId, {
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
      const userId = req.user._id;
      const { currentPassword, newPassword } = req.body;
      
      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }
      
      // Get current user data
      const user = await storageProvider.instance.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verify current password
      if (!(await comparePasswords(currentPassword, user.password))) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      // Update password
      const updatedUser = await storageProvider.instance.updateUser(userId, {
        password: await hashPassword(newPassword),
        updatedAt: new Date()
      });
      
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ error: 'Password change failed' });
    }
  });

  // Google Auth Routes
  app.get('/auth/google', passport.authenticate('google'));
  
  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/auth' }),
    (req, res) => {
      // Successful authentication, redirect to home page
      res.redirect('/');
    }
  );
  
  // Facebook Auth Routes
  app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
  
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/auth' }),
    (req, res) => {
      // Successful authentication, redirect to home page
      res.redirect('/');
    }
  );
  
  // OTP Authentication Routes
  
  // Request OTP for a given email or mobile number
  app.post('/api/auth/request-otp', async (req, res) => {
    try {
      const { email, mobile, channel } = req.body;
      
      if (!email && !mobile) {
        return res.status(400).json({ error: 'Email or mobile number is required' });
      }
      
      const contactMethod = email || mobile;
      const contactType = email ? 'email' : 'mobile';
      
      // Generate a random 6-digit OTP
      const otp = generateOTP();
      
      // Store OTP in JWT with short expiration (10 minutes)
      const token = jwt.sign(
        { 
          otp,
          contactMethod,
          contactType,
          exp: Math.floor(Date.now() / 1000) + (10 * 60) // 10 minutes expiry
        },
        JWT_SECRET
      );
      
      // Send OTP via selected channel (SMS or Email)
      let sent = false;
      if (contactType === 'mobile' && (channel === 'sms' || !channel)) {
        sent = await sendSMSOTP(contactMethod, otp);
      } else if (contactType === 'email' && (channel === 'email' || !channel)) {
        sent = await sendEmailOTP(contactMethod, otp);
      }
      
      if (!sent) {
        return res.status(500).json({ error: 'Failed to send OTP' });
      }
      
      // Return the token but not the OTP itself for security
      res.json({ 
        message: `OTP sent to your ${contactType}`,
        token,
        expiresIn: '10 minutes'
      });
    } catch (error) {
      console.error('Error requesting OTP:', error);
      res.status(500).json({ error: 'Failed to generate OTP' });
    }
  });
  
  // Verify OTP and log in or register the user
  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { token, otp, fullName } = req.body;
      
      if (!token || !otp) {
        return res.status(400).json({ error: 'Token and OTP are required' });
      }
      
      // Verify the token
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET) as { 
          otp: string; 
          contactMethod: string;
          contactType: 'email' | 'mobile';
        };
      } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      
      // Verify OTP
      if (decoded.otp !== otp) {
        return res.status(401).json({ error: 'Invalid OTP' });
      }
      
      // Find or create user
      const { contactMethod, contactType } = decoded;
      let user: any;
      
      if (contactType === 'email') {
        // Check if user with this email exists
        user = await storageProvider.instance.getUserByEmail(contactMethod);
      } else {
        // Check if user with this mobile exists
        user = await storageProvider.instance.getUserByMobile(contactMethod);
      }
      
      // Create new user if not exists
      if (!user) {
        // Generate a random username based on contact method
        const username = contactType === 'email' 
          ? contactMethod.split('@')[0] + '_' + Math.floor(1000 + Math.random() * 9000).toString()
          : 'user_' + Math.floor(10000 + Math.random() * 90000).toString();
        
        // Generate a random password
        const randomPass = randomBytes(16).toString('hex');
        
        // Create user data
        const userData: any = {
          username,
          password: await hashPassword(randomPass),
          role: UserRole.USER,
          fullName: fullName || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Set email or mobile depending on verification type
        if (contactType === 'email') {
          userData.email = contactMethod;
          userData.mobile = null;
        } else {
          userData.mobile = contactMethod;
          userData.email = null;
        }
        
        user = await storageProvider.instance.createUser(userData);
      }
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Login failed' });
        }
        
        // Return user data without password
        const { password, ...userData } = user;
        return res.status(200).json({
          message: 'OTP verified successfully',
          user: userData,
          isNewUser: !user.lastLoginAt
        });
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  });
  
  // WhatsApp Authentication
  // For sending login links via WhatsApp
  app.post('/api/auth/whatsapp-login-link', async (req, res) => {
    try {
      const { mobile } = req.body;
      
      if (!mobile) {
        return res.status(400).json({ error: 'Mobile number is required' });
      }
      
      // Check if Twilio client is initialized
      if (!twilioClient) {
        console.error('Twilio client not initialized. Cannot send WhatsApp login link.');
        return res.status(503).json({ error: 'WhatsApp service unavailable' });
      }
      
      // Generate a unique token with user information
      const token = jwt.sign(
        { 
          mobile,
          exp: Math.floor(Date.now() / 1000) + (30 * 60) // 30 minutes expiry
        },
        JWT_SECRET
      );
      
      // Create a magic login link
      const loginLink = `${req.protocol}://${req.get('host')}/auth/magic-link?token=${token}`;
      
      // Prepare WhatsApp message with login link
      const message = `Click this link to login to your TinyPaws account: ${loginLink} (This link expires in 30 minutes)`;
      
      // Send WhatsApp message using Twilio
      try {
        await twilioClient.messages.create({
          body: message,
          from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
          to: `whatsapp:${mobile}`
        });
        
        res.json({ 
          message: 'Login link sent to your WhatsApp',
          expiresIn: '30 minutes'
        });
      } catch (error) {
        console.error('Error sending WhatsApp login link:', error);
        res.status(500).json({ error: 'Failed to send WhatsApp login link' });
      }
    } catch (error) {
      console.error('Error generating WhatsApp login link:', error);
      res.status(500).json({ error: 'Failed to generate login link' });
    }
  });
  
  // Verify magic link token and log in the user
  app.get('/auth/magic-link', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.redirect('/auth?error=invalid_token');
      }
      
      // Verify the token
      let decoded;
      try {
        decoded = jwt.verify(token as string, JWT_SECRET) as { 
          mobile: string;
        };
      } catch (err) {
        return res.redirect('/auth?error=expired_token');
      }
      
      // Find user by mobile number
      const user = await storageProvider.instance.getUserByMobile(decoded.mobile);
      
      if (!user) {
        return res.redirect('/auth?error=user_not_found');
      }
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.redirect('/auth?error=login_failed');
        }
        
        // Successful login, redirect to home page
        res.redirect('/');
      });
    } catch (error) {
      console.error('Error processing magic link:', error);
      res.redirect('/auth?error=server_error');
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
    const existingAdmin = await storageProvider.instance.getUserByUsername('admin');
    
    if (!existingAdmin) {
      console.log('Creating initial admin user...');
      
      await storageProvider.instance.createUser({
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