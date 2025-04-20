import type { NextApiRequest, NextApiResponse } from 'next';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { connectToDatabase } from '@/lib/db-connect';
import { User } from '@/models';

const scryptAsync = promisify(scrypt);

// Hash password using scrypt
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, fullName, mobile } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    await connectToDatabase();

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
      fullName: fullName || null,
      mobile: mobile || null,
      role: 'customer', // default role for new registrations
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newUser.save();

    // Start session for the new user
    return new Promise<void>((resolve) => {
      req.login(newUser, (loginErr) => {
        if (loginErr) {
          console.error('Session error:', loginErr);
          res.status(500).json({ error: 'Failed to create session' });
          return resolve();
        }
        
        // Convert Mongoose document to plain object and remove sensitive fields
        const userData = newUser.toObject();
        delete userData.password;
        
        res.status(201).json(userData);
        return resolve();
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}