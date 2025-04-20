import { NextApiRequest, NextApiResponse } from 'next';
import { storageProvider } from '@/server/index';
import { UserRole } from '@/shared/next-schema';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validate schema for registration
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional(),
  mobile: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    const { username, email, password, fullName, mobile } = validatedData;

    // Initialize storage if needed
    if (!storageProvider.instance) {
      await storageProvider.initialize();
    }

    // Check if username or email already exists
    const existingUsername = await storageProvider.instance.getUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const existingEmail = await storageProvider.instance.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await storageProvider.instance.createUser({
      username,
      email,
      password: hashedPassword,
      fullName: fullName || null,
      mobile: mobile || null,
      role: UserRole.USER,
      address: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Set user in session
    req.session.user = userWithoutPassword;
    await req.session.save();

    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error in registration:', error);
    
    if (error.errors) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    
    return res.status(500).json({ message: 'Registration failed' });
  }
}