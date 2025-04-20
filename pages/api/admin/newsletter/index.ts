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

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return getSubscribers(req, res);
      case 'POST':
        return addSubscriber(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Newsletter API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get all newsletter subscribers
async function getSubscribers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { search, limit = 20, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = {};

    // Apply search filter if provided
    if (search) {
      query = {
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
        ],
      };
    }

    // Get total count for pagination
    const totalCount = await NewsletterSubscriber.countDocuments(query);
    
    // Get subscribers with pagination
    const subscribers = await NewsletterSubscriber.find(query)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      subscribers,
      pagination: {
        total: totalCount,
        page: Number(page),
        pageSize: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return res.status(500).json({ message: 'Failed to fetch subscribers' });
  }
}

// Add a new newsletter subscriber
async function addSubscriber(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if the subscriber already exists
    const existingSubscriber = await NewsletterSubscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: 'This email is already subscribed' });
    }

    // Create new subscriber
    const newSubscriber = await NewsletterSubscriber.create({
      email,
      name: name || '',
      subscribedAt: new Date(),
      isActive: true,
    });

    return res.status(201).json(newSubscriber);
  } catch (error) {
    console.error('Error adding newsletter subscriber:', error);
    return res.status(500).json({ message: 'Failed to add subscriber' });
  }
}