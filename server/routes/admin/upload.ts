import { Router, Request, Response } from 'express';
import { requireAdmin } from '../../middleware/admin-auth';
import { getUploadService } from '../../services/upload-service';

const router = Router();

// Apply admin authentication middleware to all routes
router.use(requireAdmin);

/**
 * Helper function to get error message from unknown error
 */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error || 'Unknown error occurred');
};

/**
 * Upload a single product image (admin only)
 * Route: POST /api/admin/upload/product
 */
router.post('/product', async (req: Request, res: Response) => {
  try {
    const uploadService = getUploadService();
    const imageUrl = await uploadService.uploadSingleImage(req, 'image', 'products');
    
    // Return the URL in the format expected by the client: { url: "..." }
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading product image:', error);
    res.status(500).json({ error: getErrorMessage(error) || 'Failed to upload image' });
  }
});

/**
 * Upload multiple product images (admin only)
 * Route: POST /api/admin/upload/products
 */
router.post('/products', async (req: Request, res: Response) => {
  try {
    const uploadService = getUploadService();
    const imageUrls = await uploadService.uploadMultipleImages(req, 'images', 'products', 10);
    
    // Return the URLs in the format expected by the client: { urls: [...] }
    res.status(200).json({ urls: imageUrls });
  } catch (error) {
    console.error('Error uploading product images:', error);
    res.status(500).json({ error: getErrorMessage(error) || 'Failed to upload images' });
  }
});

/**
 * Upload a category image (admin only)
 * Route: POST /api/admin/upload/category
 */
router.post('/category', async (req: Request, res: Response) => {
  try {
    const uploadService = getUploadService();
    const imageUrl = await uploadService.uploadSingleImage(req, 'image', 'categories');
    
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading category image:', error);
    res.status(500).json({ error: getErrorMessage(error) || 'Failed to upload category image' });
  }
});

/**
 * Upload a brand logo (admin only)
 * Route: POST /api/admin/upload/brand-logo
 */
router.post('/brand-logo', async (req: Request, res: Response) => {
  try {
    const uploadService = getUploadService();
    const imageUrl = await uploadService.uploadSingleImage(req, 'image', 'brands/logos');
    
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading brand logo:', error);
    res.status(500).json({ error: getErrorMessage(error) || 'Failed to upload brand logo' });
  }
});

/**
 * Upload a brand banner (admin only)
 * Route: POST /api/admin/upload/brand-banner
 */
router.post('/brand-banner', async (req: Request, res: Response) => {
  try {
    const uploadService = getUploadService();
    const imageUrl = await uploadService.uploadSingleImage(req, 'image', 'brands/banners');
    
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading brand banner:', error);
    res.status(500).json({ error: getErrorMessage(error) || 'Failed to upload brand banner' });
  }
});

/**
 * Upload a banner image (admin only)
 * Route: POST /api/admin/upload/banner
 */
router.post('/banner', async (req: Request, res: Response) => {
  try {
    const uploadService = getUploadService();
    const imageUrl = await uploadService.uploadSingleImage(req, 'image', 'banners');
    
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading banner image:', error);
    res.status(500).json({ error: getErrorMessage(error) || 'Failed to upload banner' });
  }
});

export default router;