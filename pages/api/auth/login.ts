import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/db-connect';
import { User } from '@/models';
import { comparePasswords } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    await connectToDatabase();

    // Find the user by email
    const user = await User.findOne({ email });

    // If user doesn't exist or password doesn't match
    if (!user || !(await comparePasswords(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Set the user in the session
    // @ts-ignore - req.login is provided by passport
    if (req.login) {
      req.login(user, (err: Error) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ error: 'Failed to login' });
        }

        // Convert to plain object and remove sensitive data
        const userData = user.toObject();
        delete userData.password;

        res.status(200).json(userData);
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

      res.status(200).json(userData);
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}