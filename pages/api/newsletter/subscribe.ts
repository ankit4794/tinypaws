import { NextApiRequest, NextApiResponse } from 'next';
import { NewsletterSubscriber } from '@/models';
import mongoose from 'mongoose';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to MongoDB if needed
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URL!);
    }

    // Only allow POST methods
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Subscribe to newsletter
    return subscribeToNewsletter(req, res);
  } catch (error) {
    console.error('Newsletter subscription API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Subscribe to newsletter
async function subscribeToNewsletter(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if email already exists
    const existingSubscriber = await NewsletterSubscriber.findOne({ email });
    
    if (existingSubscriber) {
      // If already active, return success
      if (existingSubscriber.active) {
        return res.status(200).json({ message: 'Email already subscribed' });
      }
      
      // If inactive, generate new verification token and reactivate
      const verificationToken = crypto.randomBytes(32).toString('hex');
      existingSubscriber.verificationToken = verificationToken;
      await existingSubscriber.save();
      
      // Send verification email (implementation would be here)
      // This is where you would use Mailgun or another email service
      
      return res.status(200).json({ 
        message: 'Please check your email to confirm your subscription'
      });
    }

    // Create new subscriber with verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const newSubscriber = new NewsletterSubscriber({
      email,
      active: false, // Require email verification
      verificationToken,
    });

    await newSubscriber.save();
    
    // Send verification email (implementation would be here)
    // This is where you would use Mailgun or another email service
    
    return res.status(201).json({ 
      message: 'Please check your email to confirm your subscription'
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return res.status(500).json({ message: 'Failed to subscribe to newsletter' });
  }
}