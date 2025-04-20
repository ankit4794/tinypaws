import { Router } from 'express';
import { withAdminAuth } from '../../../middleware/admin-auth';
import { Order, OrderItem, User, Product } from '../../models';

const router = Router();

// Get all orders (paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const status = req.query.status as string;
    
    // Build query
    const query: any = {};
    
    if (search) {
      // Try to see if search is a MongoDB ObjectId (for order lookup)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(search);
      
      if (isValidObjectId) {
        query._id = search;
      } else {
        // Look for customer info if not an order ID
        const customers = await User.find({
          $or: [
            { email: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } },
            { mobile: { $regex: search, $options: 'i' } }
          ]
        }).select('_id');
        
        const customerIds = customers.map(c => c._id);
        
        if (customerIds.length > 0) {
          query.user = { $in: customerIds };
        } else {
          // No matching customers, search by payment or status
          query.$or = [
            { paymentMethod: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } }
          ];
        }
      }
    }
    
    if (status) {
      query.status = status;
    }
    
    // Execute query with pagination
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'email fullName mobile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);
    
    // Format response
    const response = {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:id', withAdminAuth, async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Fetch order with populated fields
    const order = await Order.findById(orderId)
      .populate('user', 'email fullName mobile address')
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          select: 'name images price slug'
        }
      });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order
router.patch('/:id', withAdminAuth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const existingOrder = await Order.findById(orderId);
    
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Only allow updates to certain fields
    const allowedFields = ['status', 'paymentMethod', 'shippingAddress', 'trackingInfo'];
    const updateData = Object.entries(req.body)
      .filter(([key]) => allowedFields.includes(key))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    // Add updatedAt timestamp
    updateData.updatedAt = new Date();
    
    // Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('user', 'email fullName mobile');
    
    // Log the activity
    console.log(`Order ${orderId} updated by admin`, {
      adminId: req.session?.user?.id || 'unknown',
      changes: updateData
    });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;