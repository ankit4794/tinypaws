import { NextApiRequest, NextApiResponse } from 'next';
import { NewsletterSubscriber } from '@/models';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to MongoDB if needed
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URL!);
    }

    // Only allow GET methods
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Verify newsletter subscription
    return verifySubscription(req, res);
  } catch (error) {
    console.error('Newsletter verification API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Verify newsletter subscription
async function verifySubscription(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Find subscriber with matching token
    const subscriber = await NewsletterSubscriber.findOne({ 
      verificationToken: token as string
    });

    if (!subscriber) {
      return res.status(404).json({ message: 'Invalid or expired verification token' });
    }

    // Activate the subscription
    subscriber.active = true;
    subscriber.verificationToken = null; // Clear token after verification
    await subscriber.save();

    // Redirect to a success page or return success message
    return res.redirect(307, '/newsletter-confirmed');
  } catch (error) {
    console.error('Error verifying newsletter subscription:', error);
    return res.status(500).json({ message: 'Failed to verify subscription' });
  }
}