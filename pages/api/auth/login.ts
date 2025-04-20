import type { NextApiRequest, NextApiResponse } from 'next';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { connectToDatabase } from '@/lib/db-connect';
import { User } from '@/models';

const scryptAsync = promisify(scrypt);

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        await connectToDatabase();
        // Try to find user by email 
        const user = await User.findOne({ email });
        
        // If not found or password doesn't match, authentication fails
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    return new Promise<void>((resolve) => {
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          console.error('Authentication error:', err);
          res.status(500).json({ error: 'Internal server error' });
          return resolve();
        }
        
        if (!user) {
          res.status(401).json({ error: info?.message || 'Invalid email or password' });
          return resolve();
        }
        
        // Start session and login
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error('Session error:', loginErr);
            res.status(500).json({ error: 'Failed to create session' });
            return resolve();
          }
          
          // Convert Mongoose document to plain object and remove sensitive fields
          const userData = user.toObject();
          delete userData.password;
          
          res.status(200).json(userData);
          return resolve();
        });
      })(req, res);
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}