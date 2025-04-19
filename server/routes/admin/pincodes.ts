import { Router } from 'express';
import { storage } from '../../storage';
import { insertServiceablePincodeSchema } from '../../../shared/schema';
import { withAdminAuth } from '../../../middleware/admin-auth';

const router = Router();

// Get all pincodes (paginated)
router.get('/', withAdminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [pincodes, total] = await Promise.all([
      storage.getPincodes(skip, limit),
      storage.getPincodesCount(),
    ]);

    res.json({
      pincodes,
      total,
    });
  } catch (error) {
    console.error('Error fetching pincodes:', error);
    res.status(500).json({ error: 'Failed to fetch pincodes' });
  }
});

// Create a new pincode
router.post('/', withAdminAuth, async (req, res) => {
  try {
    const pincodeData = insertServiceablePincodeSchema.parse(req.body);
    
    // Check if pincode already exists
    const existingPincode = await storage.getPincodeByCode(pincodeData.pincode);
    if (existingPincode) {
      return res.status(400).json({ error: 'Pincode already exists' });
    }
    
    const pincode = await storage.createPincode(pincodeData);
    
    // Log the activity
    await storage.logActivity({
      user: req.session.user.id,
      action: 'create',
      resourceType: 'pincode',
      resourceId: pincode.id,
      details: { pincode: pincode.pincode },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(201).json(pincode);
  } catch (error) {
    console.error('Error creating pincode:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to create pincode' });
  }
});

// Get pincode by ID
router.get('/:id', withAdminAuth, async (req, res) => {
  try {
    const pincode = await storage.getPincode(req.params.id);
    
    if (!pincode) {
      return res.status(404).json({ error: 'Pincode not found' });
    }
    
    res.json(pincode);
  } catch (error) {
    console.error('Error fetching pincode:', error);
    res.status(500).json({ error: 'Failed to fetch pincode' });
  }
});

// Update pincode
router.patch('/:id', withAdminAuth, async (req, res) => {
  try {
    const pincodeId = req.params.id;
    const existingPincode = await storage.getPincode(pincodeId);
    
    if (!existingPincode) {
      return res.status(404).json({ error: 'Pincode not found' });
    }
    
    // Allow partial updates
    const updateData = req.body;
    
    const pincode = await storage.updatePincode(pincodeId, updateData);
    
    // Log the activity
    await storage.logActivity({
      user: req.session.user.id,
      action: 'update',
      resourceType: 'pincode',
      resourceId: pincode.id,
      details: { 
        pincode: pincode.pincode,
        changes: updateData
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(pincode);
  } catch (error) {
    console.error('Error updating pincode:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to update pincode' });
  }
});

// Delete pincode
router.delete('/:id', withAdminAuth, async (req, res) => {
  try {
    const pincodeId = req.params.id;
    const existingPincode = await storage.getPincode(pincodeId);
    
    if (!existingPincode) {
      return res.status(404).json({ error: 'Pincode not found' });
    }
    
    await storage.deletePincode(pincodeId);
    
    // Log the activity
    await storage.logActivity({
      user: req.session.user.id,
      action: 'delete',
      resourceType: 'pincode',
      resourceId: pincodeId,
      details: { pincode: existingPincode.pincode },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting pincode:', error);
    res.status(500).json({ error: 'Failed to delete pincode' });
  }
});

export default router;