import { Router } from 'express';
import { storage } from '../../storage';
import { insertDisclaimerSchema } from '../../../shared/schema';
import { withAdminAuth } from '../../../middleware/admin-auth';

const router = Router();

// Get all disclaimers (paginated)
router.get('/', withAdminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const [disclaimers, total] = await Promise.all([
     storageProvider.instance.getDisclaimers(skip, limit),
     storageProvider.instance.getDisclaimersCount(),
    ]);
    
    res.json({
      disclaimers,
      total,
    });
  } catch (error) {
    console.error('Error fetching disclaimers:', error);
    res.status(500).json({ error: 'Failed to fetch disclaimers' });
  }
});

// Create a new disclaimer
router.post('/', withAdminAuth, async (req, res) => {
  try {
    const disclaimerData = insertDisclaimerSchema.parse(req.body);
    
    const disclaimer = awaitstorageProvider.instance.createDisclaimer(disclaimerData);
    
    // Log activity
    awaitstorageProvider.instance.logActivity({
      user: req.session.user.id,
      action: 'create',
      resourceType: 'disclaimer',
      resourceId: disclaimer.id,
      details: { title: disclaimer.title, type: disclaimer.type },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(201).json(disclaimer);
  } catch (error) {
    console.error('Error creating disclaimer:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to create disclaimer' });
  }
});

// Get a specific disclaimer
router.get('/:id', withAdminAuth, async (req, res) => {
  try {
    const disclaimer = awaitstorageProvider.instance.getDisclaimer(req.params.id);
    
    if (!disclaimer) {
      return res.status(404).json({ error: 'Disclaimer not found' });
    }
    
    res.json(disclaimer);
  } catch (error) {
    console.error('Error fetching disclaimer:', error);
    res.status(500).json({ error: 'Failed to fetch disclaimer' });
  }
});

// Update a disclaimer
router.patch('/:id', withAdminAuth, async (req, res) => {
  try {
    const disclaimerId = req.params.id;
    const existingDisclaimer = awaitstorageProvider.instance.getDisclaimer(disclaimerId);
    
    if (!existingDisclaimer) {
      return res.status(404).json({ error: 'Disclaimer not found' });
    }
    
    // Allow partial updates
    const updateData = req.body;
    
    const disclaimer = awaitstorageProvider.instance.updateDisclaimer(disclaimerId, updateData);
    
    // Log activity
    awaitstorageProvider.instance.logActivity({
      user: req.session.user.id,
      action: 'update',
      resourceType: 'disclaimer',
      resourceId: disclaimerId,
      details: { 
        title: disclaimer.title,
        type: disclaimer.type,
        changes: updateData
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(disclaimer);
  } catch (error) {
    console.error('Error updating disclaimer:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to update disclaimer' });
  }
});

// Delete a disclaimer
router.delete('/:id', withAdminAuth, async (req, res) => {
  try {
    const disclaimerId = req.params.id;
    const existingDisclaimer = awaitstorageProvider.instance.getDisclaimer(disclaimerId);
    
    if (!existingDisclaimer) {
      return res.status(404).json({ error: 'Disclaimer not found' });
    }
    
    awaitstorageProvider.instance.deleteDisclaimer(disclaimerId);
    
    // Log activity
    awaitstorageProvider.instance.logActivity({
      user: req.session.user.id,
      action: 'delete',
      resourceType: 'disclaimer',
      resourceId: disclaimerId,
      details: { title: existingDisclaimer.title, type: existingDisclaimer.type },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting disclaimer:', error);
    res.status(500).json({ error: 'Failed to delete disclaimer' });
  }
});

export default router;