import { NextApiRequest, NextApiResponse } from 'next';
import { NewsletterSubscriber } from '@/models';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB if needed
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URL!);
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find subscriber
    const subscriber = await NewsletterSubscriber.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({ message: 'Email not found in our subscription list' });
    }

    // Set as inactive rather than deleting
    subscriber.isActive = false;
    await subscriber.save();

    return res.status(200).json({ 
      message: 'You have been successfully unsubscribed from our newsletter',
      success: true
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}