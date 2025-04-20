import express, { Request, Response } from 'express';
import { storageProvider } from '../../index';
import { z } from 'zod';

// Admin auth middleware function
const requireAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Check if the user has the admin role
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  
  return res.status(403).json({ message: 'Admin access required' });
};

const router = express.Router();

// Apply the admin auth middleware to all routes in this router
router.use(requireAdmin);

// Schema for validating category data
const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  parentId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  type: z.string().optional().nullable(),
});

// GET /api/admin/categories - Get all categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const storage = storageProvider.instance;
    if (!storage || !storage.getCategories) {
      return res.status(500).json({ message: 'Storage provider not initialized' });
    }
    
    const categories = await storage.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// POST /api/admin/categories - Create a new category
router.post('/', async (req: Request, res: Response) => {
  try {
    const storage = storageProvider.instance;
    if (!storage || !storage.getCategories || !storage.createCategory) {
      return res.status(500).json({ message: 'Storage provider not initialized' });
    }
    
    // Validate request body against category schema
    const categoryData = categorySchema.parse(req.body);
    
    // Check if category with the same slug already exists
    const categories = await storage.getCategories();
    const existingCategory = categories.find(cat => cat.slug === categoryData.slug);
    
    if (existingCategory) {
      return res.status(400).json({ message: 'A category with this slug already exists' });
    }
    
    // Create the category
    const category = await storage.createCategory(categoryData);
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to create category' });
  }
});

// GET /api/admin/categories/:id - Get a single category
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const storage = storageProvider.instance;
    if (!storage || !storage.getCategories) {
      return res.status(500).json({ message: 'Storage provider not initialized' });
    }
    
    const { id } = req.params;
    const categories = await storage.getCategories();
    const category = categories.find(cat => {
      return cat._id && cat._id.toString() === id;
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error(`Error fetching category with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch category' });
  }
});

// PATCH /api/admin/categories/:id - Update a category
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const storage = storageProvider.instance;
    if (!storage || !storage.getCategories || !storage.updateCategory) {
      return res.status(500).json({ message: 'Storage provider not initialized' });
    }
    
    const { id } = req.params;
    
    // Validate request body against category schema
    const categoryData = categorySchema.parse(req.body);
    
    // Check if the category exists
    const categories = await storage.getCategories();
    const existingCategory = categories.find(cat => {
      return cat._id && cat._id.toString() === id;
    });
    
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if another category with the same slug exists
    if (categoryData.slug) {
      const categoryWithSlug = categories.find(cat => 
        cat.slug === categoryData.slug && cat._id && cat._id.toString() !== id
      );
      
      if (categoryWithSlug) {
        return res.status(400).json({ message: 'A category with this slug already exists' });
      }
    }
    
    // Update the category
    const updatedCategory = await storage.updateCategory(id, categoryData);
    
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found after update' });
    }
    
    res.json(updatedCategory);
  } catch (error) {
    console.error(`Error updating category with ID ${req.params.id}:`, error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to update category' });
  }
});

// DELETE /api/admin/categories/:id - Delete a category
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const storage = storageProvider.instance;
    if (!storage || !storage.getCategories || !storage.deleteCategory) {
      return res.status(500).json({ message: 'Storage provider not initialized' });
    }
    
    const { id } = req.params;
    
    // Check if category exists
    const categories = await storage.getCategories();
    const existingCategory = categories.find(cat => {
      return cat._id && cat._id.toString() === id;
    });
    
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if this category has subcategories
    const hasSubcategories = categories.some(cat => 
      cat.parentId && cat.parentId.toString() === id
    );
    
    if (hasSubcategories) {
      // Consider whether to delete subcategories or prevent deletion
      // For now, we'll allow deletion and the subcategories will be orphaned
      console.warn(`Deleting category ${id} that has subcategories`);
    }
    
    // Delete the category
    await storage.deleteCategory(id);
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting category with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
});

export default router;