import { NextApiRequest, NextApiResponse } from 'next';
import { UserRole } from '@/shared/schema';

// Extend NextApiRequest to include session
declare module 'next' {
  interface NextApiRequest {
    session?: {
      user?: {
        id: string | number;
        username: string;
        email: string;
        role: UserRole;
        [key: string]: any;
      };
    };
  }
}

type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

export function withAdminAuth(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Check if user is authenticated
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user is an admin
    if (req.session.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    // If authenticated and admin, proceed to the handler
    return handler(req, res);
  };
}