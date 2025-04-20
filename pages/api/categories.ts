import { NextApiRequest, NextApiResponse } from 'next';
import { Category } from '@/models';
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
        return getCategories(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Categories API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get all categories with their subcategories
async function getCategories(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { featured, withSubcategories = true } = req.query;
    let query: any = { parent: null }; // Get only parent categories

    // If featured is specified, filter by featured
    if (featured) {
      query.featured = featured === 'true';
    }

    // Get parent categories
    let categories = await Category.find(query).sort({ order: 1, name: 1 });

    // Include subcategories if requested
    if (withSubcategories && withSubcategories !== 'false') {
      // For each parent category, get its subcategories
      const categoriesWithSubs = await Promise.all(
        categories.map(async (category) => {
          const subcategories = await Category.find({ parent: category._id }).sort({ order: 1, name: 1 });
          
          // Convert to plain object to allow adding properties
          const categoryObj = category.toObject();
          categoryObj.subcategories = subcategories;
          
          return categoryObj;
        })
      );

      categories = categoriesWithSubs;
    }

    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }
}