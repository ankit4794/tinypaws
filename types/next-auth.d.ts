import { Session } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user?: {
      _id: string;
      username: string;
      email: string;
      role: string;
      fullName?: string;
      mobile?: string;
      [key: string]: any;
    };
    otpToken?: string;
    googleOAuthState?: string;
    facebookOAuthState?: string;
    save: () => Promise<void>;
    destroy: () => void;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id: string;
    username: string;
    email: string;
    role: string;
    fullName?: string;
    mobile?: string;
    [key: string]: any;
  }
}