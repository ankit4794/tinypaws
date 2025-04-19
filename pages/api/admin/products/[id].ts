import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '@/server/storage';
import { withAdminAuth } from '@/middleware/admin-auth';
import { insertProductSchema } from '@/shared/schema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid product ID' });
  }

  // GET - Get a single product by ID
  if (req.method === 'GET') {
    try {
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      return res.status(200).json(product);
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      return res.status(500).json({ message: 'Failed to fetch product' });
    }
  }
  
  // PUT - Update a product
  else if (req.method === 'PUT') {
    try {
      // Check if product exists
      const existingProduct = await storage.getProductById(id);
      if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Validate request body against product schema
      const productData = insertProductSchema.parse(req.body);
      
      // Check if slug is being changed and if it already exists
      if (productData.slug !== existingProduct.slug) {
        const productWithSlug = await storage.getProductBySlug(productData.slug);
        if (productWithSlug && productWithSlug.id !== id) {
          return res.status(400).json({ message: 'A product with this slug already exists' });
        }
      }
      
      // Update the product
      const updatedProduct = await storage.updateProduct(id, productData);
      
      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      if (error.errors) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: 'Failed to update product' });
    }
  }
  
  // DELETE - Delete a product
  else if (req.method === 'DELETE') {
    try {
      // Check if product exists
      const existingProduct = await storage.getProductById(id);
      if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Delete the product
      await storage.deleteProduct(id);
      
      return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      return res.status(500).json({ message: 'Failed to delete product' });
    }
  }
  
  // Method not allowed
  else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withAdminAuth(handler);