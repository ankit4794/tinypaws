import { Router } from 'express';
import { storage } from '../../storage';
import { insertCmsPageSchema } from '../../../shared/schema';
import { withAdminAuth } from '../../../middleware/admin-auth';

const router = Router();

// Get all CMS pages (paginated)
router.get('/', withAdminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const [pages, total] = await Promise.all([
     storageProvider.instance.getCmsPages(skip, limit),
     storageProvider.instance.getCmsPagesCount(),
    ]);
    
    res.json({
      pages,
      total,
    });
  } catch (error) {
    console.error('Error fetching CMS pages:', error);
    res.status(500).json({ error: 'Failed to fetch CMS pages' });
  }
});

// Create a new CMS page
router.post('/', withAdminAuth, async (req, res) => {
  try {
    const pageData = insertCmsPageSchema.parse(req.body);
    
    // Check if a page with this slug already exists
    const existingPage = awaitstorageProvider.instance.getCmsPageBySlug(pageData.slug);
    if (existingPage) {
      return res.status(400).json({ error: 'A page with this slug already exists' });
    }
    
    // Set author to current admin user
    const pageWithAuthor = {
      ...pageData,
      author: req.session.user.id,
    };
    
    const page = awaitstorageProvider.instance.createCmsPage(pageWithAuthor);
    
    // Log activity
    awaitstorageProvider.instance.logActivity({
      user: req.session.user.id,
      action: 'create',
      resourceType: 'cms-page',
      resourceId: page.id,
      details: { title: page.title, slug: page.slug },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(201).json(page);
  } catch (error) {
    console.error('Error creating CMS page:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to create CMS page' });
  }
});

// Get a specific CMS page
router.get('/:id', withAdminAuth, async (req, res) => {
  try {
    const page = awaitstorageProvider.instance.getCmsPage(req.params.id);
    
    if (!page) {
      return res.status(404).json({ error: 'CMS page not found' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('Error fetching CMS page:', error);
    res.status(500).json({ error: 'Failed to fetch CMS page' });
  }
});

// Update a CMS page
router.patch('/:id', withAdminAuth, async (req, res) => {
  try {
    const pageId = req.params.id;
    const existingPage = awaitstorageProvider.instance.getCmsPage(pageId);
    
    if (!existingPage) {
      return res.status(404).json({ error: 'CMS page not found' });
    }
    
    // Allow partial updates
    const updateData = req.body;
    
    // If slug is being updated, check it's not already in use
    if (updateData.slug && updateData.slug !== existingPage.slug) {
      const pageWithSlug = awaitstorageProvider.instance.getCmsPageBySlug(updateData.slug);
      if (pageWithSlug && pageWithSlug.id.toString() !== pageId) {
        return res.status(400).json({ error: 'Slug is already in use by another page' });
      }
    }
    
    const page = awaitstorageProvider.instance.updateCmsPage(pageId, updateData);
    
    // Log activity
    awaitstorageProvider.instance.logActivity({
      user: req.session.user.id,
      action: 'update',
      resourceType: 'cms-page',
      resourceId: pageId,
      details: { 
        title: page.title,
        slug: page.slug,
        changes: updateData
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(page);
  } catch (error) {
    console.error('Error updating CMS page:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to update CMS page' });
  }
});

// Delete a CMS page
router.delete('/:id', withAdminAuth, async (req, res) => {
  try {
    const pageId = req.params.id;
    const existingPage = awaitstorageProvider.instance.getCmsPage(pageId);
    
    if (!existingPage) {
      return res.status(404).json({ error: 'CMS page not found' });
    }
    
    awaitstorageProvider.instance.deleteCmsPage(pageId);
    
    // Log activity
    awaitstorageProvider.instance.logActivity({
      user: req.session.user.id,
      action: 'delete',
      resourceType: 'cms-page',
      resourceId: pageId,
      details: { title: existingPage.title, slug: existingPage.slug },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting CMS page:', error);
    res.status(500).json({ error: 'Failed to delete CMS page' });
  }
});

export default router;