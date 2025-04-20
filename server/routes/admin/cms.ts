import { Router } from 'express';
import { withAdminAuth } from '../../../middleware/admin-auth';
import { CmsPage } from '../../models';

const router = Router();

// Get all CMS pages (paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    
    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const [pages, total] = await Promise.all([
      CmsPage.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'fullName email')
        .lean(),
      CmsPage.countDocuments(query)
    ]);
    
    // Format response
    const response = {
      pages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching CMS pages:', error);
    res.status(500).json({ error: 'Failed to fetch CMS pages' });
  }
});

// Create a new CMS page
router.post('/', withAdminAuth, async (req, res) => {
  try {
    const pageData = req.body;
    
    // Check if a page with this slug already exists
    const existingPage = await CmsPage.findOne({ slug: pageData.slug });
    if (existingPage) {
      return res.status(400).json({ error: 'A page with this slug already exists' });
    }
    
    // Set author to current admin user if available
    const pageWithAuthor = {
      ...pageData,
      author: req.session?.user?.id || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Create new CMS page
    const newPage = new CmsPage(pageWithAuthor);
    const savedPage = await newPage.save();
    
    // Log activity
    console.log(`CMS page created by admin`, {
      adminId: req.session?.user?.id || 'unknown',
      pageId: savedPage._id,
      title: savedPage.title
    });
    
    res.status(201).json(savedPage);
  } catch (error) {
    console.error('Error creating CMS page:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to create CMS page' });
  }
});

// Get a specific CMS page
router.get('/:id', withAdminAuth, async (req, res) => {
  try {
    const pageId = req.params.id;
    
    const page = await CmsPage.findById(pageId)
      .populate('author', 'fullName email')
      .lean();
    
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
    
    // Fetch existing page
    const existingPage = await CmsPage.findById(pageId);
    
    if (!existingPage) {
      return res.status(404).json({ error: 'CMS page not found' });
    }
    
    const updateData = req.body;
    
    // If slug is being updated, check it's not already in use by another page
    if (updateData.slug && updateData.slug !== existingPage.slug) {
      const pageWithSlug = await CmsPage.findOne({ slug: updateData.slug });
      if (pageWithSlug && pageWithSlug._id.toString() !== pageId) {
        return res.status(400).json({ error: 'Slug is already in use by another page' });
      }
    }
    
    // Add updated timestamp
    updateData.updatedAt = new Date();
    
    // Update the page
    const updatedPage = await CmsPage.findByIdAndUpdate(
      pageId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('author', 'fullName email');
    
    // Log activity
    console.log(`CMS page updated by admin`, {
      adminId: req.session?.user?.id || 'unknown',
      pageId: updatedPage._id,
      title: updatedPage.title
    });
    
    res.json(updatedPage);
  } catch (error) {
    console.error('Error updating CMS page:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to update CMS page' });
  }
});

// Delete a CMS page
router.delete('/:id', withAdminAuth, async (req, res) => {
  try {
    const pageId = req.params.id;
    
    // Find the page first to verify it exists
    const existingPage = await CmsPage.findById(pageId);
    
    if (!existingPage) {
      return res.status(404).json({ error: 'CMS page not found' });
    }
    
    // Delete the page
    await CmsPage.findByIdAndDelete(pageId);
    
    // Log activity
    console.log(`CMS page deleted by admin`, {
      adminId: req.session?.user?.id || 'unknown',
      pageId: pageId,
      title: existingPage.title
    });
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting CMS page:', error);
    res.status(500).json({ error: 'Failed to delete CMS page' });
  }
});

export default router;