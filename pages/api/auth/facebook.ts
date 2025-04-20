import { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';

// Facebook OAuth client
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'}/api/auth/facebook/callback`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate configuration
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
    return res.status(500).json({ message: 'Facebook OAuth not configured' });
  }

  if (req.method === 'GET') {
    // Generate state parameter to prevent CSRF
    const state = randomBytes(16).toString('hex');
    
    // Store state in session
    req.session.facebookOAuthState = state;
    await req.session.save();

    // Build Facebook authorization URL
    const authUrl = new URL('https://www.facebook.com/v16.0/dialog/oauth');
    authUrl.searchParams.append('client_id', FACEBOOK_APP_ID);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', 'email public_profile');
    
    // Redirect user to Facebook
    res.redirect(authUrl.toString());
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}