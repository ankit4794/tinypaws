import { Router } from 'express';
import { storage } from '../../storage';
import { insertPromotionSchema } from '../../../shared/schema';
import { withAdminAuth } from '../../../middleware/admin-auth';

const router = Router();

// Get all promotions (paginated)
router.get('/', withAdminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Extract filters
    const filters: Record<string, any> = {};
    
    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.type) {
      filters.type = req.query.type;
    }
    
    // Date range filters
    if (req.query.startDate) {
      filters.endDate = { $gte: new Date(req.query.startDate as string) };
    }
    
    if (req.query.endDate) {
      filters.startDate = { $lte: new Date(req.query.endDate as string) };
    }
    
    const [promotions, total] = await Promise.all([
     storageProvider.instance.getPromotions(skip, limit, filters),
     storageProvider.instance.getPromotionsCount(filters),
    ]);
    
    res.json({
      promotions,
      total,
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
});

// Create a new promotion
router.post('/', withAdminAuth, async (req, res) => {
  try {
    const promotionData = insertPromotionSchema.parse(req.body);
    
    // Check if a promotion with this code already exists
    const existingPromotion = awaitstorageProvider.instance.getPromotionByCode(promotionData.code);
    if (existingPromotion) {
      return res.status(400).json({ error: 'A promotion with this code already exists' });
    }
    
    const promotion = awaitstorageProvider.instance.createPromotion(promotionData);
    
    // Log activity
    awaitstorageProvider.instance.logActivity({
      user: req.session.user.id,
      action: 'create',
      resourceType: 'promotion',
      resourceId: promotion.id,
      details: { name: promotion.name, code: promotion.code, type: promotion.type },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(201).json(promotion);
  } catch (error) {
    console.error('Error creating promotion:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to create promotion' });
  }
});

// Get a specific promotion
router.get('/:id', withAdminAuth, async (req, res) => {
  try {
    const promotion = awaitstorageProvider.instance.getPromotion(req.params.id);
    
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    res.json(promotion);
  } catch (error) {
    console.error('Error fetching promotion:', error);
    res.status(500).json({ error: 'Failed to fetch promotion' });
  }
});

// Update a promotion
router.patch('/:id', withAdminAuth, async (req, res) => {
  try {
    const promotionId = req.params.id;
    const existingPromotion = awaitstorageProvider.instance.getPromotion(promotionId);
    
    if (!existingPromotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    // Allow partial updates
    const updateData = req.body;
    
    // If code is being updated, check it's not already in use
    if (updateData.code && updateData.code !== existingPromotion.code) {
      const promoWithCode = awaitstorageProvider.instance.getPromotionByCode(updateData.code);
      if (promoWithCode && promoWithCode.id.toString() !== promotionId) {
        return res.status(400).json({ error: 'Code is already in use by another promotion' });
      }
    }
    
    const promotion = awaitstorageProvider.instance.updatePromotion(promotionId, updateData);
    
    // Log activity
    awaitstorageProvider.instance.logActivity({
      user: req.session.user.id,
      action: 'update',
      resourceType: 'promotion',
      resourceId: promotionId,
      details: { 
        name: promotion.name,
        code: promotion.code,
        type: promotion.type,
        changes: updateData
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(promotion);
  } catch (error) {
    console.error('Error updating promotion:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to update promotion' });
  }
});

// Delete a promotion
router.delete('/:id', withAdminAuth, async (req, res) => {
  try {
    const promotionId = req.params.id;
    const existingPromotion = awaitstorageProvider.instance.getPromotion(promotionId);
    
    if (!existingPromotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    awaitstorageProvider.instance.deletePromotion(promotionId);
    
    // Log activity
    awaitstorageProvider.instance.logActivity({
      user: req.session.user.id,
      action: 'delete',
      resourceType: 'promotion',
      resourceId: promotionId,
      details: { 
        name: existingPromotion.name,
        code: existingPromotion.code,
        type: existingPromotion.type
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ error: 'Failed to delete promotion' });
  }
});

// Get usage metrics for a promotion
router.get('/:id/usage', withAdminAuth, async (req, res) => {
  try {
    const promotionId = req.params.id;
    const metrics = awaitstorageProvider.instance.getPromotionUsageMetrics(promotionId);
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching promotion usage metrics:', error);
    res.status(500).json({ error: 'Failed to fetch promotion usage metrics' });
  }
});

export default router;