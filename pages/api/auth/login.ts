import { NextApiRequest, NextApiResponse } from 'next';
import { storageProvider } from '@/server/index';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validate schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Initialize storage if needed
    if (!storageProvider.instance) {
      await storageProvider.initialize();
    }

    // Check if user exists
    const user = await storageProvider.instance.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Set user in session
    req.session.user = userWithoutPassword;
    await req.session.save();

    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error in login:', error);
    
    if (error.errors) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    
    return res.status(500).json({ message: 'Login failed' });
  }
}