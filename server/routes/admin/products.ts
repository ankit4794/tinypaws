import express from 'express';
import { Request, Response } from 'express';
import { z } from 'zod';
import { Product, insertProductSchema, insertProductVariantSchema } from '@shared/schema';
import { storageProvider } from '../../index';
import { requireAdmin } from '../../middleware/admin-auth';

const router = express.Router();

// Get all products (admin)
router.get('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Use regular products method
    const products = await storageProvider.instance.getProducts();
    
    // Populate category information for each product
    const populatedProducts = await Promise.all(
      products.map(async (product: any) => {
        if (product.category) {
          // Get the category name
          const category = await storageProvider.instance.getCategoryBySlug(
            product.category.toString()
          );
          return {
            ...product.toObject(),
            category: category || { name: 'Unknown' }
          };
        }
        return product.toObject();
      })
    );
    
    res.json(populatedProducts);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ message: 'Failed to get products' });
  }
});

// Get a single product by ID (admin)
router.get('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await storageProvider.instance.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ message: 'Failed to get product' });
  }
});

// Create a new product (admin)
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const validatedData = insertProductSchema.parse(req.body);
    
    if (!storageProvider.instance.createProduct) {
      return res.status(501).json({ message: 'Product creation not implemented' });
    }
    
    // Create the product
    const product = await storageProvider.instance.createProduct(validatedData);
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid product data', errors: error.errors });
    }
    
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// Update a product (admin)
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate the request body
    const validatedData = insertProductSchema.partial().parse(req.body);
    
    if (!storageProvider.instance.updateProduct) {
      return res.status(501).json({ message: 'Product update not implemented' });
    }
    
    // Update the product
    const product = await storageProvider.instance.updateProduct(id, validatedData);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid product data', errors: error.errors });
    }
    
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// Delete a product (admin)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!storageProvider.instance.deleteProduct) {
      return res.status(501).json({ message: 'Product deletion not implemented' });
    }
    
    await storageProvider.instance.deleteProduct(id);
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// Add product variant - custom implementation until storage is updated
router.post('/:id/variants', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate the request body
    const validatedData = insertProductVariantSchema.parse(req.body);
    
    // Get the product first
    const product = await storageProvider.instance.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if this is the first variant
    if (!product.variants) {
      product.variants = [];
    }
    
    // Add the variant
    const newVariant = {
      ...validatedData,
      _id: new Date().getTime().toString(), // Create a unique ID
    };
    
    product.variants.push(newVariant);
    
    // Set hasVariants to true
    product.hasVariants = true;
    if (!product.variantType || product.variantType === 'none') {
      product.variantType = validatedData.weightUnit ? 'weight' : 'pack';
    }
    
    // Use the existing updateProduct method
    if (!storageProvider.instance.updateProduct) {
      return res.status(501).json({ message: 'Product variant creation not implemented - update method missing' });
    }
    
    const updatedProduct = await storageProvider.instance.updateProduct(id, product);
    
    res.status(201).json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid variant data', errors: error.errors });
    }
    
    console.error('Error adding product variant:', error);
    res.status(500).json({ message: 'Failed to add product variant' });
  }
});

// Update product variant - custom implementation until storage is updated
router.put('/:id/variants/:variantId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id, variantId } = req.params;
    
    // Validate the request body
    const validatedData = insertProductVariantSchema.partial().parse(req.body);
    
    // Get the product first
    const product = await storageProvider.instance.getProductById(id);
    
    if (!product || !product.variants) {
      return res.status(404).json({ message: 'Product or variants not found' });
    }
    
    // Find the variant index
    const variantIndex = product.variants.findIndex((v: any) => v._id.toString() === variantId);
    
    if (variantIndex === -1) {
      return res.status(404).json({ message: 'Variant not found' });
    }
    
    // Update the variant
    product.variants[variantIndex] = {
      ...product.variants[variantIndex],
      ...validatedData
    };
    
    // Use the existing updateProduct method
    if (!storageProvider.instance.updateProduct) {
      return res.status(501).json({ message: 'Product variant update not implemented - update method missing' });
    }
    
    const updatedProduct = await storageProvider.instance.updateProduct(id, product);
    
    res.json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid variant data', errors: error.errors });
    }
    
    console.error('Error updating product variant:', error);
    res.status(500).json({ message: 'Failed to update product variant' });
  }
});

// Delete product variant - custom implementation until storage is updated
router.delete('/:id/variants/:variantId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id, variantId } = req.params;
    
    // Get the product first
    const product = await storageProvider.instance.getProductById(id);
    
    if (!product || !product.variants) {
      return res.status(404).json({ message: 'Product or variants not found' });
    }
    
    // Filter out the variant to delete
    product.variants = product.variants.filter((v: any) => v._id.toString() !== variantId);
    
    // If no variants left, update variant status
    if (product.variants.length === 0) {
      product.hasVariants = false;
      product.variantType = 'none';
    }
    
    // Use the existing updateProduct method
    if (!storageProvider.instance.updateProduct) {
      return res.status(501).json({ message: 'Product variant deletion not implemented - update method missing' });
    }
    
    await storageProvider.instance.updateProduct(id, product);
    
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting product variant:', error);
    res.status(500).json({ message: 'Failed to delete product variant' });
  }
});

export default router;