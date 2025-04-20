import { Router } from 'express';
import { withAdminAuth } from '../../../middleware/admin-auth';
import { User } from '../../models';

const router = Router();

// Get all customers (paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    
    // Build query
    const query: any = { role: 'USER' };
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const [customers, total] = await Promise.all([
      User.find(query)
        .select('-password') // Exclude password
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);
    
    // Format response
    const response = {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID
router.get('/:id', withAdminAuth, async (req, res) => {
  try {
    const customerId = req.params.id;
    
    // Fetch customer directly from MongoDB
    const customer = await User.findById(customerId)
      .select('-password') // Don't return password
      .lean();
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Update customer (admin can update certain fields)
router.patch('/:id', withAdminAuth, async (req, res) => {
  try {
    const customerId = req.params.id;
    
    // Fetch existing customer directly from MongoDB
    const existingCustomer = await User.findById(customerId);
    
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Only allow updates to certain fields (not password)
    const allowedFields = ['status', 'fullName', 'email', 'mobile', 'address', 'notes'];
    const updateData = Object.entries(req.body)
      .filter(([key]) => allowedFields.includes(key))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    // Add updatedAt timestamp
    updateData.updatedAt = new Date();
    
    // Update customer in MongoDB
    const updatedCustomer = await User.findByIdAndUpdate(
      customerId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    // In a real app, you would log the activity to an ActivityLog collection
    // For now, we'll just log to console
    console.log(`Customer ${customerId} updated by admin`, {
      adminId: req.session?.user?.id || 'unknown',
      changes: updateData
    });
    
    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

export default router;