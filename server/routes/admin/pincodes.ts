import { Router, Request, Response } from 'express';
import { withAdminAuth } from '../../../middleware/admin-auth';
import { ServiceablePincode } from '../../models';

const router = Router();

// Get all pincodes (paginated)
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    
    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { pincode: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const [pincodes, total] = await Promise.all([
      ServiceablePincode.find(query)
        .sort({ pincode: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ServiceablePincode.countDocuments(query)
    ]);
    
    // Format response
    const response = {
      pincodes,
      pagination: {
        total,
        page, 
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching pincodes:', error);
    res.status(500).json({ error: 'Failed to fetch pincodes' });
  }
});

// Create a new pincode
router.post('/', withAdminAuth, async (req, res) => {
  try {
    const pincodeData = req.body;
    
    // Check if pincode already exists
    const existingPincode = await ServiceablePincode.findOne({ pincode: pincodeData.pincode });
    if (existingPincode) {
      return res.status(400).json({ error: 'Pincode already exists' });
    }
    
    // Create new ServiceablePincode document
    const newPincode = new ServiceablePincode({
      ...pincodeData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Save to database
    const savedPincode = await newPincode.save();
    
    // Log activity
    console.log(`Pincode created by admin`, {
      adminId: req.session?.user?.id || 'unknown',
      pincode: savedPincode.pincode
    });
    
    res.status(201).json(savedPincode);
  } catch (error) {
    console.error('Error creating pincode:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to create pincode' });
  }
});

// Get pincode by ID
router.get('/:id', withAdminAuth, async (req, res) => {
  try {
    const pincodeId = req.params.id;
    
    const pincode = await ServiceablePincode.findById(pincodeId).lean();
    
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
    
    // Check if pincode exists
    const existingPincode = await ServiceablePincode.findById(pincodeId);
    
    if (!existingPincode) {
      return res.status(404).json({ error: 'Pincode not found' });
    }
    
    const updateData = req.body;
    
    // If pincode is being changed, check for duplicates
    if (updateData.pincode && updateData.pincode !== existingPincode.pincode) {
      const duplicate = await ServiceablePincode.findOne({ pincode: updateData.pincode });
      if (duplicate && duplicate._id.toString() !== pincodeId) {
        return res.status(400).json({ error: 'Pincode already exists' });
      }
    }
    
    // Add updated timestamp
    updateData.updatedAt = new Date();
    
    // Update pincode in database
    const updatedPincode = await ServiceablePincode.findByIdAndUpdate(
      pincodeId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    // Log activity
    console.log(`Pincode updated by admin`, {
      adminId: req.session?.user?.id || 'unknown',
      pincode: updatedPincode.pincode
    });
    
    res.json(updatedPincode);
  } catch (error) {
    console.error('Error updating pincode:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to update pincode' });
  }
});

// Delete pincode
router.delete('/:id', withAdminAuth, async (req, res) => {
  try {
    const pincodeId = req.params.id;
    
    // Check if pincode exists
    const existingPincode = await ServiceablePincode.findById(pincodeId);
    
    if (!existingPincode) {
      return res.status(404).json({ error: 'Pincode not found' });
    }
    
    // Delete from database
    await ServiceablePincode.findByIdAndDelete(pincodeId);
    
    // Log activity
    console.log(`Pincode deleted by admin`, {
      adminId: req.session?.user?.id || 'unknown',
      pincode: existingPincode.pincode
    });
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting pincode:', error);
    res.status(500).json({ error: 'Failed to delete pincode' });
  }
});

export default router;