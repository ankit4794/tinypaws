import type { NextApiRequest, NextApiResponse } from 'next';
import { storageProvider } from '../../server';
import { hashPassword } from '../../server/auth';
import { UserRole } from '../../shared/schema';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, email, password, fullName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    const storage = storageProvider.instance;
    
    // Check if username already exists
    const existingUsername = await storage.getUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user
    const newUser = await storage.createUser({
      username,
      email,
      password: hashedPassword,
      fullName: fullName || '',
      role: UserRole.CUSTOMER,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Set the user in the session
    req.session.user = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role
    };

    await req.session.save();

    // Return the user without the password
    return res.status(201).json({
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}