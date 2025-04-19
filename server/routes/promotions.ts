import { Router } from 'express';
import { storageProvider } from '../index';

const router = Router();

// Validate a promotion code
router.post('/validate', async (req, res) => {
  try {
    const { code, cartTotal, cartItems } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Promotion code is required' });
    }
    
    const promotion = awaitstorageProvider.instance.getPromotionByCode(code);
    
    // Check if promotion exists and is active
    if (!promotion || !promotion.isActive) {
      return res.status(404).json({ error: 'Invalid promotion code' });
    }
    
    // Check if promotion has expired
    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      return res.status(400).json({ error: 'Promotion code has expired or not yet active' });
    }
    
    // Check minimum order value
    if (cartTotal < promotion.minOrderValue) {
      return res.status(400).json({ 
        error: `Minimum order value of ₹${promotion.minOrderValue} required for this promotion` 
      });
    }
    
    // Check if user has already used this promotion (if authenticated)
    if (req.isAuthenticated() && promotion.perUserLimit > 0) {
      const userId = req.user.id;
      const usageCount = awaitstorageProvider.instance.getUserPromotionUsageCount(userId, promotion.id);
      
      if (usageCount >= promotion.perUserLimit) {
        return res.status(400).json({ 
          error: 'You have already used this promotion the maximum number of times' 
        });
      }
    }
    
    // Calculate discount based on promotion type
    let discount = 0;
    let applicableItems = [];
    
    // For promotions that apply to specific products
    if (promotion.applicableProducts && promotion.applicableProducts.length > 0) {
      applicableItems = cartItems.filter(item => 
        promotion.applicableProducts.includes(item.productId)
      );
      
      if (applicableItems.length === 0) {
        return res.status(400).json({ 
          error: 'This promotion does not apply to any items in your cart' 
        });
      }
      
      const applicableTotal = applicableItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      
      if (promotion.isPercentage) {
        discount = (applicableTotal * promotion.value) / 100;
      } else {
        discount = promotion.value;
      }
    } 
    // For promotions that apply to specific categories
    else if (promotion.applicableCategories && promotion.applicableCategories.length > 0) {
      // Get product categories for items in cart
      const productIds = cartItems.map(item => item.productId);
      const products = awaitstorageProvider.instance.getProductsByIds(productIds);
      
      // Filter cart items whose products belong to applicable categories
      applicableItems = cartItems.filter(item => {
        const product = products.find(p => p.id.toString() === item.productId);
        return product && promotion.applicableCategories.includes(product.category);
      });
      
      if (applicableItems.length === 0) {
        return res.status(400).json({ 
          error: 'This promotion does not apply to any items in your cart' 
        });
      }
      
      const applicableTotal = applicableItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      
      if (promotion.isPercentage) {
        discount = (applicableTotal * promotion.value) / 100;
      } else {
        discount = promotion.value;
      }
    } 
    // For promotions that apply to the entire cart
    else {
      if (promotion.isPercentage) {
        discount = (cartTotal * promotion.value) / 100;
      } else {
        discount = promotion.value;
      }
    }
    
    // Apply maximum discount cap if set
    if (promotion.maxDiscount && discount > promotion.maxDiscount) {
      discount = promotion.maxDiscount;
    }
    
    res.json({
      valid: true,
      promotion: {
        id: promotion.id,
        code: promotion.code,
        name: promotion.name,
        type: promotion.type,
        discount: parseFloat(discount.toFixed(2)),
        applicableItems: applicableItems.map(item => item.productId)
      }
    });
    
  } catch (error) {
    console.error('Error validating promotion:', error);
    res.status(500).json({ error: 'Failed to validate promotion code' });
  }
});

// Get active promotions for display in the storefront
router.get('/active', async (req, res) => {
  try {
    const promotions = awaitstorageProvider.instance.getActivePromotions();
    
    // Don't send back sensitive data like usage limits
    const safePromotions = promotions.map(promo => ({
      id: promo.id,
      name: promo.name,
      code: promo.code,
      type: promo.type,
      value: promo.value,
      isPercentage: promo.isPercentage,
      minOrderValue: promo.minOrderValue,
      startDate: promo.startDate,
      endDate: promo.endDate,
    }));
    
    res.json(safePromotions);
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    res.status(500).json({ error: 'Failed to fetch active promotions' });
  }
});

export default router;