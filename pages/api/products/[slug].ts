import { NextApiRequest, NextApiResponse } from 'next';
import { Product } from '@/models';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to MongoDB if needed
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URL!);
    }

    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ message: 'Product slug is required' });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return getProductBySlug(req, res, slug as string);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Product API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get a product by its slug
async function getProductBySlug(req: NextApiRequest, res: NextApiResponse, slug: string) {
  try {
    // Find product by slug
    const product = await Product.findOne({ slug })
      .populate('category', 'name slug parent')
      .populate('brand', 'name slug logo')
      .populate('relatedProducts', 'name slug price salePrice images inStock');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get parent category if exists
    let parentCategory = null;
    if (product.category && product.category.parent) {
      parentCategory = await mongoose.model('Category').findById(product.category.parent);
    }

    // Add parent category to the response
    const productObj = product.toObject();
    if (parentCategory) {
      productObj.parentCategory = {
        _id: parentCategory._id,
        name: parentCategory.name,
        slug: parentCategory.slug
      };
    }

    return res.status(200).json(productObj);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ message: 'Failed to fetch product' });
  }
}