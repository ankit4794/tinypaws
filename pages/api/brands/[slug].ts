import { NextApiRequest, NextApiResponse } from 'next';
import { Brand, Product } from '@/models';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to MongoDB if needed
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URL!);
    }

    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ message: 'Brand slug is required' });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return getBrandBySlug(req, res, slug as string);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Brand API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get a brand by its slug and its products
async function getBrandBySlug(req: NextApiRequest, res: NextApiResponse, slug: string) {
  try {
    // Extract query parameters for product filtering and pagination
    const {
      limit = 20,
      page = 1,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    let sortOption: any = {};

    // Set up sort options
    if (sort) {
      const sortOrder = order === 'asc' ? 1 : -1;
      sortOption[sort as string] = sortOrder;
    }

    // Find brand by slug
    const brand = await Brand.findOne({ slug });
    
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    // Count total products of this brand
    const totalCount = await Product.countDocuments({ brand: brand._id });

    // Get products of this brand with pagination
    const products = await Product.find({ brand: brand._id })
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('category', 'name slug');

    return res.status(200).json({
      brand,
      products,
      pagination: {
        total: totalCount,
        page: Number(page),
        pageSize: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    return res.status(500).json({ message: 'Failed to fetch brand' });
  }
}