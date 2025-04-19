import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '@/server/storage';
import { insertUserSchema } from '@/shared/schema';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate request body against schema
    const userData = insertUserSchema.parse(req.body);

    // Check if username already exists
    const existingUsername = await storage.getUserByUsername(userData.username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(userData.email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create the user with hashed password
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // Set user in session
    req.session.user = userWithoutPassword;
    await req.session.save();

    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.errors) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    return res.status(500).json({ message: 'Failed to register user' });
  }
}