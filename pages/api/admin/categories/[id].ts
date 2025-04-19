import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '@/server/storage';
import { withAdminAuth } from '@/middleware/admin-auth';
import { insertCategorySchema } from '@/shared/schema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid category ID' });
  }

  // GET - Get category details
  if (req.method === 'GET') {
    try {
      const categories = await storage.getCategories();
      const category = categories.find(cat => cat.id.toString() === id);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      // Get subcategories if this is a parent category
      const subcategories = await storage.getSubcategories(id);
      
      return res.status(200).json({
        ...category,
        subcategories
      });
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      return res.status(500).json({ message: 'Failed to fetch category' });
    }
  }
  
  // PUT - Update a category
  else if (req.method === 'PUT') {
    try {
      // Check if updateCategory method exists in the storage implementation
      if (!storage.updateCategory) {
        return res.status(501).json({ message: 'updateCategory method not implemented in the storage' });
      }
      
      // Validate request body against category schema
      const categoryData = insertCategorySchema.parse(req.body);
      
      // Check if slug is being changed and if it already exists
      const categories = await storage.getCategories();
      const existingCategory = categories.find(cat => cat.id.toString() === id);
      
      if (!existingCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      if (categoryData.slug !== existingCategory.slug) {
        const categoryWithSlug = await storage.getCategoryBySlug(categoryData.slug);
        if (categoryWithSlug && categoryWithSlug.id.toString() !== id) {
          return res.status(400).json({ message: 'A category with this slug already exists' });
        }
      }
      
      // Update the category
      const updatedCategory = await storage.updateCategory(id, categoryData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      return res.status(200).json(updatedCategory);
    } catch (error) {
      console.error(`Error updating category with ID ${id}:`, error);
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: 'Failed to update category' });
    }
  }
  
  // DELETE - Delete a category
  else if (req.method === 'DELETE') {
    try {
      // Check if deleteCategory method exists in the storage implementation
      if (!storage.deleteCategory) {
        return res.status(501).json({ message: 'deleteCategory method not implemented in the storage' });
      }
      
      // Check if category exists
      const categories = await storage.getCategories();
      const existingCategory = categories.find(cat => cat.id.toString() === id);
      
      if (!existingCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      // Delete the category
      await storage.deleteCategory(id);
      
      return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error(`Error deleting category with ID ${id}:`, error);
      return res.status(500).json({ message: 'Failed to delete category' });
    }
  }
  
  // Method not allowed
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withAdminAuth(handler);