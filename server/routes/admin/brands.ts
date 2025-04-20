import express from 'express';
import { storageProvider } from '../../index';
import { isAdmin } from '../../middleware/admin-auth';
import { slugify } from '../../utils/helpers';
import multer from 'multer';
import { uploadToGCS } from '../../services/gcs-upload';

const router = express.Router();

// Apply admin authentication middleware
router.use(isAdmin);

// Get all brands
router.get('/', async (req, res) => {
  try {
    const brands = await storageProvider.instance.getBrands();
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Get a specific brand by ID
router.get('/:id', async (req, res) => {
  try {
    const brand = await storageProvider.instance.getBrandById(req.params.id);
    
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
});

// Create a brand
// Configure multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const brandData: any = JSON.parse(req.body.data);
    
    // Generate slug from brand name
    if (!brandData.slug && brandData.name) {
      brandData.slug = slugify(brandData.name);
    }
    
    // Upload images to Google Cloud Storage if provided
    if (files.logo && files.logo.length > 0) {
      const logoUrl = await uploadToGCS(files.logo[0], 'brands');
      brandData.logo = logoUrl;
    }
    
    if (files.bannerImage && files.bannerImage.length > 0) {
      const bannerUrl = await uploadToGCS(files.bannerImage[0], 'brands');
      brandData.bannerImage = bannerUrl;
    }
    
    const newBrand = await storageProvider.instance.createBrand(brandData);
    res.status(201).json(newBrand);
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ error: 'Failed to create brand' });
  }
});

// Update a brand
router.put('/:id', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const brandData: any = JSON.parse(req.body.data);
    
    // Generate slug from brand name if name is being updated and slug isn't provided
    if (brandData.name && !brandData.slug) {
      brandData.slug = slugify(brandData.name);
    }
    
    // Upload images to Google Cloud Storage if provided
    if (files.logo && files.logo.length > 0) {
      const logoUrl = await uploadToGCS(files.logo[0], 'brands');
      brandData.logo = logoUrl;
    }
    
    if (files.bannerImage && files.bannerImage.length > 0) {
      const bannerUrl = await uploadToGCS(files.bannerImage[0], 'brands');
      brandData.bannerImage = bannerUrl;
    }
    
    const updatedBrand = await storageProvider.instance.updateBrand(id, brandData);
    
    if (!updatedBrand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    res.json(updatedBrand);
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

// Delete a brand
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if brand exists
    const brand = await storageProvider.instance.getBrandById(id);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    
    // Check if any products are using this brand
    const products = await storageProvider.instance.getProductsByBrand(id);
    if (products.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete brand that has products. Remove or reassign products first.',
        productCount: products.length
      });
    }
    
    await storageProvider.instance.deleteBrand(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

// Get products by brand
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const products = await storageProvider.instance.getProductsByBrand(id);
    res.json(products);
  } catch (error) {
    console.error('Error fetching brand products:', error);
    res.status(500).json({ error: 'Failed to fetch brand products' });
  }
});

export default router;