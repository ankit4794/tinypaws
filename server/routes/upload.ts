import { Router, Request, Response } from 'express';
import { getUploadService } from '../services/upload-service';

const router = Router();

// Upload a single product image
router.post('/product-image', async (req: Request, res: Response) => {
  try {
    const uploadService = getUploadService();
    const imageUrl = await uploadService.uploadSingleImage(req, 'image', 'products');
    
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading product image:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
});

// Upload multiple product images
router.post('/product-images', async (req: Request, res: Response) => {
  try {
    const uploadService = getUploadService();
    const imageUrls = await uploadService.uploadMultipleImages(req, 'images', 'products', 10);
    
    res.status(200).json({ urls: imageUrls });
  } catch (error) {
    console.error('Error uploading product images:', error);
    res.status(500).json({ error: error.message || 'Failed to upload images' });
  }
});

// Upload a banner image
router.post('/banner', async (req: Request, res: Response) => {
  try {
    const uploadService = getUploadService();
    const imageUrl = await uploadService.uploadSingleImage(req, 'image', 'banners');
    
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading banner image:', error);
    res.status(500).json({ error: error.message || 'Failed to upload banner' });
  }
});

// Upload a category image
router.post('/category-image', async (req: Request, res: Response) => {
  try {
    const uploadService = getUploadService();
    const imageUrl = await uploadService.uploadSingleImage(req, 'image', 'categories');
    
    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading category image:', error);
    res.status(500).json({ error: error.message || 'Failed to upload category image' });
  }
});

export default router;