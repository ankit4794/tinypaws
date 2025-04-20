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
  // Validate configuration
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ message: 'Google OAuth not configured' });
  }

  if (req.method === 'GET') {
    // Generate state parameter to prevent CSRF
    const state = randomBytes(16).toString('hex');
    
    // Store state in session
    req.session.googleOAuthState = state;
    await req.session.save();

    // Build Google authorization URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'email profile');
    authUrl.searchParams.append('state', state);
    
    // Redirect user to Google
    res.redirect(authUrl.toString());
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}