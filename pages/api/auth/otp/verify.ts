import { NextApiRequest, NextApiResponse } from 'next';
import { storageProvider } from '@/server/index';
import { UserRole } from '@/shared/next-schema';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

// JWT secret for OTP tokens
const JWT_SECRET = process.env.JWT_SECRET || 'tinypaws-jwt-secret-key-123';

// Validate schema for OTP verification
const verifySchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
  username: z.string().min(3, 'Username is required'),
  fullName: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validatedData = verifySchema.parse(req.body);
    const { otp, username, fullName } = validatedData;

    // Check if OTP token exists in session
    if (!req.session.otpToken) {
      return res.status(400).json({ message: 'No OTP request found. Please request a new OTP.' });
    }

    // Verify token and extract data
    let tokenData;
    try {
      tokenData = jwt.verify(req.session.otpToken, JWT_SECRET) as {
        otp: string;
        type: 'email' | 'mobile';
        value: string;
        createdAt: string;
      };
    } catch (error) {
      console.error('Error verifying OTP token:', error);
      return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
    }

    // Verify OTP matches
    if (tokenData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Initialize storage if needed
    if (!storageProvider.instance) {
      await storageProvider.initialize();
    }

    // Check if username already exists
    const existingUsername = await storageProvider.instance.getUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if the email/mobile is already registered
    let field = {};
    if (tokenData.type === 'email') {
      field = { email: tokenData.value };
      const existingEmail = await storageProvider.instance.getUserByEmail(tokenData.value);
      if (existingEmail) {
        // If user already exists, log them in
        const { password, ...userWithoutPassword } = existingEmail;
        
        // Set user in session
        req.session.user = userWithoutPassword;
        await req.session.save();
        
        return res.status(200).json({ 
          message: 'Login successful', 
          user: userWithoutPassword,
          isExistingUser: true 
        });
      }
    } else {
      field = { mobile: tokenData.value };
      const existingMobile = await storageProvider.instance.getUserByMobile(tokenData.value);
      if (existingMobile) {
        // If user already exists, log them in
        const { password, ...userWithoutPassword } = existingMobile;
        
        // Set user in session
        req.session.user = userWithoutPassword;
        await req.session.save();
        
        return res.status(200).json({ 
          message: 'Login successful', 
          user: userWithoutPassword,
          isExistingUser: true 
        });
      }
    }

    // Create a new user
    const randomPassword = randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    
    const userData = {
      username,
      password: hashedPassword,
      fullName: fullName || null,
      role: UserRole.USER,
      address: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...field,
    };
    
    // For non-provided field, set to null
    if (tokenData.type === 'email') {
      userData.mobile = null;
    } else {
      userData.email = null;
    }
    
    const user = await storageProvider.instance.createUser(userData);

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;

    // Set user in session
    req.session.user = userWithoutPassword;
    await req.session.save();

    // Clear OTP token
    delete req.session.otpToken;

    return res.status(201).json({ 
      message: 'Account created successfully', 
      user: userWithoutPassword,
      isExistingUser: false
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    
    if (error.errors) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
}