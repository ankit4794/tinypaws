import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Check if a pincode is serviceable
router.get('/check', async (req, res) => {
  try {
    const { pincode } = req.query;
    
    if (!pincode || typeof pincode !== 'string') {
      return res.status(400).json({ error: 'Pincode is required' });
    }
    
    const pincodeData = await storage.getPincodeByCode(pincode);
    
    if (!pincodeData) {
      return res.json({
        isServiceable: false,
        pincode,
      });
    }
    
    if (!pincodeData.isActive) {
      return res.json({
        isServiceable: false,
        pincode,
        message: 'This location is currently not serviceable',
      });
    }
    
    return res.json({
      isServiceable: true,
      pincode,
      city: pincodeData.city,
      state: pincodeData.state,
      deliveryDays: pincodeData.deliveryDays,
      codAvailable: pincodeData.codAvailable,
    });
  } catch (error) {
    console.error('Error checking pincode:', error);
    res.status(500).json({ error: 'Failed to check pincode' });
  }
});

// Get all active pincodes for frontend use
router.get('/', async (req, res) => {
  try {
    const pincodes = await storage.getActivePincodes();
    
    res.json(pincodes);
  } catch (error) {
    console.error('Error fetching pincodes:', error);
    res.status(500).json({ error: 'Failed to fetch pincodes' });
  }
});

export default router;