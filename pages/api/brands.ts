import { NextApiRequest, NextApiResponse } from 'next';
import { Brand } from '@/models';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to MongoDB if needed
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URL!);
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return getBrands(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Brands API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get all brands
async function getBrands(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { featured, limit } = req.query;
    let query: any = {};

    // If featured is specified, filter by featured
    if (featured) {
      query.featured = featured === 'true';
    }

    // Create base query
    let brandsQuery = Brand.find(query).sort({ name: 1 });

    // Apply limit if specified
    if (limit) {
      brandsQuery = brandsQuery.limit(Number(limit));
    }

    // Execute query
    const brands = await brandsQuery;

    return res.status(200).json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return res.status(500).json({ message: 'Failed to fetch brands' });
  }
}