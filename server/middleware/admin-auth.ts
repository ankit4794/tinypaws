import { Request, Response, NextFunction } from 'express';

// Middleware to check if the user is authenticated and has admin role
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if the user has the admin role
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  
  return res.status(403).json({ error: 'Admin access required' });
}