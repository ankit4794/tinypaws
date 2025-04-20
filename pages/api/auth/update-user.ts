import { NextApiRequest, NextApiResponse } from 'next';
import { storageProvider } from '@/server/index';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validate schema for user update
const updateUserSchema = z.object({
  fullName: z.string().optional(),
  mobile: z.string().optional(),
  address: z.record(z.string()).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
}).refine((data) => {
  // If newPassword is provided, currentPassword must also be provided
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'Current password is required to set a new password',
  path: ['currentPassword'],
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if user is logged in
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.session.user._id;

    // Initialize storage if needed
    if (!storageProvider.instance) {
      await storageProvider.initialize();
    }

    // Get current user
    const currentUser = await storageProvider.instance.getUser(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate request body
    const validatedData = updateUserSchema.parse(req.body);
    const { currentPassword, newPassword, ...updateData } = validatedData;

    // If password change is requested, verify current password
    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Add timestamp
    updateData.updatedAt = new Date();

    // Update user
    const updatedUser = await storageProvider.instance.updateUser(userId, updateData);
    if (!updatedUser) {
      return res.status(500).json({ message: 'Failed to update user' });
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = updatedUser;

    // Update session
    req.session.user = userWithoutPassword;
    await req.session.save();

    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error.errors) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    
    return res.status(500).json({ message: 'Failed to update user' });
  }
}