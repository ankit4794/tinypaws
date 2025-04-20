import type { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import { User } from '@/models';
import { connectToDatabase } from '@/lib/db-connect';
import { promisify } from 'util';
import { scrypt, timingSafeEqual } from 'crypto';

// Passport Configurations
passport.serializeUser((user, done) => {
  // @ts-ignore - Mongoose document has _id
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    await connectToDatabase();
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

const scryptAsync = promisify(scrypt);

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Local strategy setup
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        await connectToDatabase();
        const user = await User.findOne({ email });
        
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Export a middleware that will run for each API route
export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  // This middleware only applies to API routes
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return;
  }

  // The middleware runs before each API route but doesn't modify the request or response
  return NextResponse.next();
}