import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Get a list of all published CMS pages (for sitemap, footer links, etc.)
router.get('/', async (req, res) => {
  try {
    const pages = await storage.getPublicCmsPages();
    res.json(pages);
  } catch (error) {
    console.error('Error fetching CMS pages:', error);
    res.status(500).json({ error: 'Failed to fetch CMS pages' });
  }
});

// Get a specific CMS page by its slug
router.get('/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const page = await storage.getCmsPageBySlug(slug);
    
    if (!page || !page.isActive) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('Error fetching CMS page:', error);
    res.status(500).json({ error: 'Failed to fetch CMS page' });
  }
});

export default router;