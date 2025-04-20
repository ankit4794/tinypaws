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

// Get all categories with hierarchical structure
async function getCategories(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get all categories
    const allCategories = await Category.find().sort({ name: 1 });
    
    // Create a map of categories by id for faster lookup
    const categoriesMap = new Map();
    allCategories.forEach(category => {
      categoriesMap.set(category._id.toString(), {
        ...category.toObject(),
        subcategories: []
      });
    });
    
    // Build the hierarchical structure
    const rootCategories = [];
    
    allCategories.forEach(category => {
      const categoryId = category._id.toString();
      const categoryWithSubcategories = categoriesMap.get(categoryId);
      
      if (category.parent) {
        // This is a subcategory
        const parentId = category.parent.toString();
        const parentCategory = categoriesMap.get(parentId);
        
        if (parentCategory) {
          parentCategory.subcategories.push(categoryWithSubcategories);
        }
      } else {
        // This is a root category
        rootCategories.push(categoryWithSubcategories);
      }
    });
    
    // Sort subcategories alphabetically
    rootCategories.forEach(category => {
      category.subcategories.sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return res.status(200).json(rootCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }
}