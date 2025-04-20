import { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin } from '@/middleware/auth';
import { NewsletterSubscriber } from '@/models';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check admin authorization
    try {
      await isAdmin(req, res);
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;

    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: 'Invalid subscriber ID' });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return getSubscriber(req, res, id as string);
      case 'PUT':
        return updateSubscriber(req, res, id as string);
      case 'DELETE':
        return deleteSubscriber(req, res, id as string);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Newsletter subscriber API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get a specific newsletter subscriber
async function getSubscriber(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const subscriber = await NewsletterSubscriber.findById(id);
    
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    return res.status(200).json(subscriber);
  } catch (error) {
    console.error('Error fetching newsletter subscriber:', error);
    return res.status(500).json({ message: 'Failed to fetch subscriber' });
  }
}

// Update a newsletter subscriber
async function updateSubscriber(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { email, name, isActive } = req.body;

    // Check if subscriber exists
    const subscriber = await NewsletterSubscriber.findById(id);
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    // Check if the email already exists (excluding the current subscriber)
    if (email && email !== subscriber.email) {
      const existingSubscriber = await NewsletterSubscriber.findOne({ email, _id: { $ne: id } });
      if (existingSubscriber) {
        return res.status(400).json({ message: 'This email is already subscribed' });
      }
    }

    // Update subscriber
    const updatedSubscriber = await NewsletterSubscriber.findByIdAndUpdate(
      id,
      {
        email: email || subscriber.email,
        name: name !== undefined ? name : subscriber.name,
        isActive: isActive !== undefined ? isActive : subscriber.isActive,
      },
      { new: true }
    );

    return res.status(200).json(updatedSubscriber);
  } catch (error) {
    console.error('Error updating newsletter subscriber:', error);
    return res.status(500).json({ message: 'Failed to update subscriber' });
  }
}

// Delete a newsletter subscriber
async function deleteSubscriber(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const deletedSubscriber = await NewsletterSubscriber.findByIdAndDelete(id);
    
    if (!deletedSubscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    return res.status(200).json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    console.error('Error deleting newsletter subscriber:', error);
    return res.status(500).json({ message: 'Failed to delete subscriber' });
  }
}