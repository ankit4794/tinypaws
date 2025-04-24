import express from 'express';
import { Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Product, Category } from '../../models';
import { insertProductSchema, insertProductVariantSchema } from '@shared/schema';
import { requireAdmin } from '../../middleware/admin-auth';

const router = express.Router();

// Get all products (admin)
router.get('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const categoryId = req.query.category as string;
    const brandId = req.query.brand as string;
    
    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (categoryId) {
      query.category = categoryId;
    }
    
    if (brandId) {
      query.brand = brandId;
    }
    
    // Execute query with pagination
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('brand', 'name slug logo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);
    
    // Format response
    const response = {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ message: 'Failed to get products' });
  }
});

// Get a single product by ID (admin)
router.get('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Find product by ID and populate related fields
    const product = await Product.findById(id)
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .lean();
    
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
    
    // Create a slug from the name if not provided
    if (!validatedData.slug) {
      validatedData.slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug: validatedData.slug });
    if (existingProduct) {
      return res.status(400).json({ 
        message: 'A product with this slug already exists. Please choose a different name or provide a unique slug.' 
      });
    }
    
    // Create timestamps
    const now = new Date();
    
    // Create the product
    const newProduct = new Product({
      ...validatedData,
      createdAt: now,
      updatedAt: now
    });
    
    const savedProduct = await newProduct.save();
    
    res.status(201).json(savedProduct);
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
    
    // Check if product exists
    const existingProduct = await Product.findById(id);
    
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // If slug is being updated, check for uniqueness
    if (validatedData.slug && validatedData.slug !== existingProduct.slug) {
      const slugExists = await Product.findOne({ 
        slug: validatedData.slug, 
        _id: { $ne: id } 
      });
      
      if (slugExists) {
        return res.status(400).json({ 
          message: 'A product with this slug already exists. Please choose a different slug.' 
        });
      }
    }
    
    // Create update data with updatedAt timestamp
    const updateData = {
      ...validatedData,
      updatedAt: new Date()
    };
    
    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo');
    
    res.json(updatedProduct);
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
    
    // Check if product exists
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete the product
    await Product.findByIdAndDelete(id);
    
    // Consider: Also delete related items like reviews, cart items, etc.
    
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// Add product variant - using MongoDB direct access
router.post('/:id/variants', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate the request body
    const validatedData = insertProductVariantSchema.parse(req.body);
    
    // Get the product first
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if this is the first variant
    if (!product.variants) {
      product.variants = [];
    }
    
    // Add the variant with mongoose ObjectId
    const newVariant = {
      ...validatedData,
      _id: new mongoose.Types.ObjectId(),
    };
    
    // Push the new variant to the array
    product.variants.push(newVariant);
    
    // Set hasVariants to true and determine variant type
    product.hasVariants = true;
    if (!product.variantType || product.variantType === 'none') {
      product.variantType = validatedData.weightUnit ? 'weight' : 'pack';
    }
    
    // Update the modified timestamp
    product.updatedAt = new Date();
    
    // Save the updated product
    await product.save();
    
    // Fetch the updated product with populated fields
    const updatedProduct = await Product.findById(id)
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo');
    
    res.status(201).json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid variant data', errors: error.errors });
    }
    
    console.error('Error adding product variant:', error);
    res.status(500).json({ message: 'Failed to add product variant' });
  }
});

// Update product variant - using MongoDB direct access
router.put('/:id/variants/:variantId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id, variantId } = req.params;
    
    // Validate the request body
    const validatedData = insertProductVariantSchema.partial().parse(req.body);
    
    // Find the product
    const product = await Product.findById(id);
    
    if (!product || !product.variants || product.variants.length === 0) {
      return res.status(404).json({ message: 'Product or variants not found' });
    }
    
    // Find the variant index
    const variantIndex = product.variants.findIndex((v: any) => 
      v._id.toString() === variantId
    );
    
    if (variantIndex === -1) {
      return res.status(404).json({ message: 'Variant not found' });
    }
    
    // Update the variant by merging the existing variant with the updated data
    // Check if the variant is a Mongoose document or a plain object
    const existingVariant = product.variants[variantIndex];
    const variantData = typeof existingVariant.toObject === 'function' 
      ? existingVariant.toObject() 
      : existingVariant;
      
    product.variants[variantIndex] = {
      ...variantData,
      ...validatedData
    };
    
    // Update the modified timestamp
    product.updatedAt = new Date();
    
    // Save the updated product
    await product.save();
    
    // Fetch the updated product with populated fields
    const updatedProduct = await Product.findById(id)
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo');
    
    res.json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid variant data', errors: error.errors });
    }
    
    console.error('Error updating product variant:', error);
    res.status(500).json({ message: 'Failed to update product variant' });
  }
});

// Delete product variant - using MongoDB direct access
router.delete('/:id/variants/:variantId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id, variantId } = req.params;
    
    // Find the product
    const product = await Product.findById(id);
    
    if (!product || !product.variants || product.variants.length === 0) {
      return res.status(404).json({ message: 'Product or variants not found' });
    }
    
    // Filter out the variant to delete
    product.variants = product.variants.filter((v: any) => 
      v._id.toString() !== variantId
    );
    
    // If no variants left, update variant status
    if (product.variants.length === 0) {
      product.hasVariants = false;
      product.variantType = 'none';
    }
    
    // Update the modified timestamp
    product.updatedAt = new Date();
    
    // Save the updated product
    await product.save();
    
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting product variant:', error);
    res.status(500).json({ message: 'Failed to delete product variant' });
  }
});

export default router;