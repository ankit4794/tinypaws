import { NextApiRequest, NextApiResponse } from 'next';
import { Product, Category } from '@/models';
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
        return getProducts(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get products with filtering, sorting, and pagination
async function getProducts(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      search,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      featured,
      newArrival,
      bestseller,
      onSale,
      inStock,
      sort = 'createdAt',
      order = 'desc',
      limit = 20,
      page = 1,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    let query: any = {};
    let sortOption: any = {};

    // Apply search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      // First, check if the category exists
      const categoryObj = await Category.findOne({ slug: category });
      
      if (categoryObj) {
        // If subcategory is specified, filter by it
        if (subcategory) {
          const subcategoryObj = await Category.findOne({ 
            slug: subcategory, 
            parent: categoryObj._id 
          });
          
          if (subcategoryObj) {
            query.category = subcategoryObj._id;
          }
        } else {
          // If no subcategory, get all products in this category or its subcategories
          const subcategories = await Category.find({ parent: categoryObj._id });
          const subcategoryIds = subcategories.map(sub => sub._id);
          
          query.$or = [
            { category: categoryObj._id },
            { category: { $in: subcategoryIds } }
          ];
        }
      }
    }

    // Brand filter
    if (brand) {
      query.brand = brand;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Featured products filter
    if (featured === 'true') {
      query.featured = true;
    }

    // New arrival filter
    if (newArrival === 'true') {
      query.newArrival = true;
    }

    // Bestseller filter
    if (bestseller === 'true') {
      query.bestseller = true;
    }

    // On sale filter
    if (onSale === 'true') {
      query.salePrice = { $ne: null, $gt: 0 };
    }

    // In stock filter
    if (inStock === 'true') {
      query.inStock = true;
    }

    // Sorting
    if (sort) {
      const sortOrder = order === 'asc' ? 1 : -1;
      sortOption[sort as string] = sortOrder;
    }

    // Get total count for pagination
    const totalCount = await Product.countDocuments(query);

    // Get products with pagination
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo');

    return res.status(200).json({
      products,
      pagination: {
        total: totalCount,
        page: Number(page),
        pageSize: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Failed to fetch products' });
  }
}