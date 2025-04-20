import { NextApiRequest, NextApiResponse } from 'next';
import { storageProvider } from '@/server/index';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { loginSchema } from '@/shared/next-schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate request body against login schema
    const { email, password } = loginSchema.parse(req.body);

    if (!storageProvider.instance) {
      await storageProvider.initialize();
    }

    // Get user by email
    const user = await storageProvider.instance.getUserByEmail(email);
    
    // If user doesn't exist or password doesn't match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Set user in session
    req.session.user = userWithoutPassword;
    await req.session.save();

    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error logging in:', error);
    if (error.errors) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    return res.status(500).json({ message: 'Failed to login' });
  }
}