import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '@/server/storage';
import { withAdminAuth } from '@/middleware/admin-auth';
import { insertProductSchema } from '@/shared/schema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - Get all products with pagination and search
  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      
      // Get products based on search term if provided
      let products = await storage.getProducts();
      
      // Apply search filter if search term is provided
      if (search) {
        products = products.filter(product => 
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.description?.toLowerCase().includes(search.toLowerCase()) ||
          product.brand?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Calculate pagination
      const totalItems = products.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      // Get paginated products
      const paginatedProducts = products.slice(startIndex, endIndex);
      
      return res.status(200).json({
        products: paginatedProducts,
        totalPages,
        currentPage: page,
        totalItems
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ message: 'Failed to fetch products' });
    }
  }
  
  // POST - Create a new product
  else if (req.method === 'POST') {
    try {
      // Validate request body against product schema
      const productData = insertProductSchema.parse(req.body);
      
      // Check if product with the same slug already exists
      const existingProduct = await storage.getProductBySlug(productData.slug);
      if (existingProduct) {
        return res.status(400).json({ message: 'A product with this slug already exists' });
      }
      
      // Create the product
      const product = await storage.createProduct(productData);
      
      return res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: 'Failed to create product' });
    }
  }
  
  // Method not allowed
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withAdminAuth(handler);