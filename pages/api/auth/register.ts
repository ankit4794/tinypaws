import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/db-connect';
import { User } from '@/models';
import { hashPassword } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, fullName, mobile } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    await connectToDatabase();

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Create new user
    const hashedPassword = await hashPassword(password);
    const user = new User({
      email,
      username: email.split('@')[0],
      password: hashedPassword,
      fullName,
      mobile,
      role: 'user',
    });

    await user.save();

    // Set the user in the session
    // @ts-ignore - req.login is provided by passport
    if (req.login) {
      req.login(user, (err: Error) => {
        if (err) {
          console.error('Registration login error:', err);
          return res.status(500).json({ error: 'Registration succeeded but failed to login' });
        }

        // Convert to plain object and remove sensitive data
        const userData = user.toObject();
        delete userData.password;

        res.status(201).json(userData);
      });
    } else {
      // Convert to plain object and remove sensitive data
      const userData = user.toObject();
      delete userData.password;

      // Use session manually if req.login is not available
      // @ts-ignore - session is available
      if (req.session) {
        // @ts-ignore - session is available
        req.session.passport = { user: user._id };
        // @ts-ignore - session is available
        await new Promise<void>((resolve) => req.session.save(() => resolve()));
      }

      res.status(201).json(userData);
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}