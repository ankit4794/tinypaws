import { Router } from 'express';
import { storageProvider } from '../../index';
import { PromotionType } from '../../../shared/schema';
import { requireAdmin } from '../../middleware/admin-auth';

const router = Router();

// Get all promotions (paginated)
router.get('/', requireAdmin, async (req, res) => {
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
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
});

// Create a new promotion
router.post('/', requireAdmin, async (req, res) => {
  try {
    const promotionData = req.body;
    
    // Validate required fields
    if (!promotionData.name || !promotionData.code || !promotionData.value) {
      return res.status(400).json({ error: 'Name, code and value are required fields' });
    }
    
    // Check if a promotion with this code already exists
    const existingPromotion = await storageProvider.instance.getPromotionByCode(promotionData.code);
    if (existingPromotion) {
      return res.status(400).json({ error: 'A promotion with this code already exists' });
    }
    
    // Set defaults if missing
    if (!promotionData.type) {
      promotionData.type = PromotionType.DISCOUNT;
    }
    
    // Parse dates
    if (promotionData.startDate) {
      promotionData.startDate = new Date(promotionData.startDate);
    } else {
      promotionData.startDate = new Date();
    }
    
    if (promotionData.endDate) {
      promotionData.endDate = new Date(promotionData.endDate);
    } else {
      // Default to 30 days from now
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      promotionData.endDate = endDate;
    }
    
    const promotion = await storageProvider.instance.createPromotion(promotionData);
    
    res.status(201).json(promotion);
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ error: 'Failed to create promotion' });
  }
});

// Get a specific promotion
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const promotion = await storageProvider.instance.getPromotion(req.params.id);
    
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
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const promotionId = req.params.id;
    const existingPromotion = await storageProvider.instance.getPromotion(promotionId);
    
    if (!existingPromotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    // Allow partial updates
    const updateData = req.body;
    
    // If code is being updated, check it's not already in use
    if (updateData.code && updateData.code !== existingPromotion.code) {
      const promoWithCode = await storageProvider.instance.getPromotionByCode(updateData.code);
      if (promoWithCode && promoWithCode._id.toString() !== promotionId) {
        return res.status(400).json({ error: 'Code is already in use by another promotion' });
      }
    }
    
    // Parse dates if provided
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    
    const promotion = await storageProvider.instance.updatePromotion(promotionId, updateData);
    
    res.json(promotion);
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ error: 'Failed to update promotion' });
  }
});

// Delete a promotion
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const promotionId = req.params.id;
    const existingPromotion = await storageProvider.instance.getPromotion(promotionId);
    
    if (!existingPromotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    const result = await storageProvider.instance.deletePromotion(promotionId);
    
    if (result) {
      res.status(204).end();
    } else {
      res.status(500).json({ error: 'Failed to delete promotion' });
    }
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ error: 'Failed to delete promotion' });
  }
});

// Get user usage count for a promotion
router.get('/:id/usage/:userId', requireAdmin, async (req, res) => {
  try {
    const { id, userId } = req.params;
    const count = await storageProvider.instance.getUserPromotionUsageCount(userId, id);
    
    res.json({ count });
  } catch (error) {
    console.error('Error fetching promotion usage count:', error);
    res.status(500).json({ error: 'Failed to fetch promotion usage count' });
  }
});

export default router;