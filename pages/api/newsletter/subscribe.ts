import { NextApiRequest, NextApiResponse } from 'next';
import { NewsletterSubscriber } from '@/models';
import mongoose from 'mongoose';
import { z } from 'zod';

// Validation schema
const subscriberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().optional(),
});

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

    // Validate request data
    try {
      subscriberSchema.parse(req.body);
    } catch (error) {
      console.error('Validation error:', error);
      return res.status(400).json({ message: 'Invalid data' });
    }

    const { email, name } = req.body;

    // Check if already subscribed
    const existingSubscriber = await NewsletterSubscriber.findOne({ email });
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(409).json({ message: 'Email is already subscribed' });
      } else {
        // Reactivate the subscription
        existingSubscriber.isActive = true;
        existingSubscriber.name = name || existingSubscriber.name;
        await existingSubscriber.save();
        return res.status(200).json({ 
          message: 'Your subscription has been reactivated',
          success: true 
        });
      }
    }

    // Create new subscriber
    const newSubscriber = new NewsletterSubscriber({
      email,
      name: name || '',
      subscribedAt: new Date(),
      isActive: true,
    });

    await newSubscriber.save();

    return res.status(201).json({ 
      message: 'Thank you for subscribing to our newsletter',
      success: true 
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}