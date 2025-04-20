import { NextApiRequest, NextApiResponse } from 'next';
import { storageProvider } from '@/server/index';
import { UserRole } from '@/shared/next-schema';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

// Google OAuth client
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/auth/google/callback`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Validate configuration
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ message: 'Google OAuth not configured' });
  }

  try {
    const { code, state } = req.query;

    // Validate state to prevent CSRF
    if (!code || !state || state !== req.session.googleOAuthState) {
      return res.status(400).json({ message: 'Invalid OAuth state' });
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: Array.isArray(code) ? code[0] : code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Error exchanging code for token:', errorData);
      return res.status(400).json({ message: 'Failed to authenticate with Google' });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user profile
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      const errorData = await profileResponse.text();
      console.error('Error fetching Google profile:', errorData);
      return res.status(400).json({ message: 'Failed to fetch Google profile' });
    }

    const profile = await profileResponse.json();

    // Verify email exists
    if (!profile.email) {
      return res.status(400).json({ message: 'Email permission is required' });
    }

    // Initialize storage if needed
    if (!storageProvider.instance) {
      await storageProvider.initialize();
    }

    // Check if user already exists by email
    let user = await storageProvider.instance.getUserByEmail(profile.email);

    if (!user) {
      // Create a new user if they don't exist
      const randomPassword = randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      // Create username from email (remove non-alphanumeric chars)
      const username = profile.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      
      // Check if username exists and append random number if it does
      let uniqueUsername = username;
      let existingUsername = await storageProvider.instance.getUserByUsername(uniqueUsername);
      if (existingUsername) {
        uniqueUsername = `${username}${Math.floor(Math.random() * 10000)}`;
      }
      
      user = await storageProvider.instance.createUser({
        username: uniqueUsername,
        email: profile.email,
        password: hashedPassword,
        fullName: profile.name || null,
        mobile: null,
        role: UserRole.USER,
        address: null,
        googleId: profile.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else if (!user.googleId) {
      // If user exists but doesn't have googleId, update it
      user = await storageProvider.instance.updateUser(user._id, {
        googleId: profile.id,
        updatedAt: new Date(),
      });
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;

    // Set user in session
    req.session.user = userWithoutPassword;
    await req.session.save();

    // Redirect to home page
    res.redirect('/');
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
}