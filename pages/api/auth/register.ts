import { NextApiRequest, NextApiResponse } from 'next';
import { storageProvider } from '@/server/index';
import { registerSchema } from '@/shared/next-schema';
import { UserRole } from '@/shared/next-schema';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate request body against schema
    const userData = registerSchema.parse(req.body);

    if (!storageProvider.instance) {
      await storageProvider.initialize();
    }

    // Check if username already exists
    const existingUsername = await storageProvider.instance.getUserByUsername(userData.username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await storageProvider.instance.getUserByEmail(userData.email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if mobile already exists (if provided)
    if (userData.mobile) {
      const existingMobile = await storageProvider.instance.getUserByMobile(userData.mobile);
      if (existingMobile) {
        return res.status(400).json({ message: 'Mobile number already exists' });
      }
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create the user with hashed password
    const user = await storageProvider.instance.createUser({
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
      fullName: userData.fullName || null,
      mobile: userData.mobile || null,
      role: UserRole.USER,
      address: null,
      createdAt: new Date(),
      updatedAt: new Date(),
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