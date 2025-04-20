import { NextApiRequest, NextApiResponse } from 'next';
import { NewsletterSubscriber } from '@/models';
import mongoose from 'mongoose';
import { isAdmin } from '@/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify admin access
    try {
      await isAdmin(req, res);
    } catch (error) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Connect to MongoDB if needed
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URL!);
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return getSubscribers(req, res);
      case 'POST':
        return addSubscriber(req, res);
      case 'DELETE':
        return deleteSubscriber(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin newsletter API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get all newsletter subscribers with pagination and filtering
async function getSubscribers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    let query: any = {};
    let sortOption: any = {};

    // Apply search filter
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Apply status filter
    if (status) {
      query.active = status === 'active';
    }

    // Set up sort options
    if (sort) {
      const sortOrder = order === 'asc' ? 1 : -1;
      sortOption[sort as string] = sortOrder;
    }

    // Count total subscribers for pagination
    const totalCount = await NewsletterSubscriber.countDocuments(query);

    // Get subscribers with pagination
    const subscribers = await NewsletterSubscriber.find(query)
      .sort(sortOption)
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

// Add a new subscriber (for admin, bypass verification)
async function addSubscriber(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if email already exists
    const existingSubscriber = await NewsletterSubscriber.findOne({ email });
    if (existingSubscriber) {
      // If inactive, reactivate it
      if (!existingSubscriber.active) {
        existingSubscriber.active = true;
        await existingSubscriber.save();
        return res.status(200).json({ message: 'Subscriber reactivated successfully' });
      }
      return res.status(400).json({ message: 'Email already subscribed' });
    }

    // Create new subscriber
    const newSubscriber = new NewsletterSubscriber({
      email,
      active: true, // Admin adds are automatically active
      verificationToken: null, // No verification needed for admin adds
    });

    await newSubscriber.save();
    return res.status(201).json({ message: 'Subscriber added successfully', subscriber: newSubscriber });
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return res.status(500).json({ message: 'Failed to add subscriber' });
  }
}

// Delete a subscriber
async function deleteSubscriber(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { subscriberId } = req.body;

    if (!subscriberId) {
      return res.status(400).json({ message: 'Subscriber ID is required' });
    }

    // Delete the subscriber
    const result = await NewsletterSubscriber.findByIdAndDelete(subscriberId);
    
    if (!result) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    return res.status(200).json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return res.status(500).json({ message: 'Failed to delete subscriber' });
  }
}