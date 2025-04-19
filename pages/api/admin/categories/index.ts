import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '@/server/storage';
import { withAdminAuth } from '@/middleware/admin-auth';
import { insertCategorySchema } from '@/shared/schema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - Get all categories
  if (req.method === 'GET') {
    try {
      const categories = await storage.getCategories();
      return res.status(200).json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ message: 'Failed to fetch categories' });
    }
  }
  
  // POST - Create a new category
  else if (req.method === 'POST') {
    try {
      // Validate request body against category schema
      const categoryData = insertCategorySchema.parse(req.body);
      
      // Check if category with the same slug already exists
      const existingCategory = await storage.getCategoryBySlug(categoryData.slug);
      if (existingCategory) {
        return res.status(400).json({ message: 'A category with this slug already exists' });
      }
      
      // Create the category
      const category = await storage.createCategory(categoryData);
      
      return res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: 'Failed to create category' });
    }
  }
  
  // Method not allowed
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withAdminAuth(handler);