import { Router } from 'express';
import { withAdminAuth } from '../../../middleware/admin-auth';
import { HelpDeskTicket, User } from '../../models';
import mongoose from 'mongoose';

const router = Router();

// Get all helpdesk tickets (paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Get filters if any
    const statusFilter = req.query.status;
    const priorityFilter = req.query.priority;
    const searchTerm = req.query.search as string;

    // Build filter object
    const filter: any = {};
    if (statusFilter) filter.status = statusFilter;
    if (priorityFilter) filter.priority = priorityFilter;
    if (searchTerm) {
      filter.$or = [
        { subject: { $regex: searchTerm, $options: 'i' } },
        { message: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Count total documents with the filter
    const total = await HelpDeskTicket.countDocuments(filter);
    
    // Get tickets with pagination
    const tickets = await HelpDeskTicket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'fullName email username')
      .populate('assignedTo', 'fullName email username')
      .populate('orderRef')
      .populate('productRef', 'name slug images')
      .lean();
    
    const totalPages = Math.ceil(total / limit);
    
    // Return paginated results
    res.json({
      tickets,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching helpdesk tickets:', error);
    res.status(500).json({ error: 'Failed to fetch helpdesk tickets' });
  }
});

// Get a specific helpdesk ticket
router.get('/:id', withAdminAuth, async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }
    
    const ticket = await HelpDeskTicket.findById(ticketId)
      .populate('user', 'fullName email username')
      .populate('assignedTo', 'fullName email username')
      .populate('orderRef')
      .populate('productRef', 'name slug images')
      .populate({
        path: 'responses',
        populate: {
          path: 'user',
          select: 'fullName email username'
        }
      })
      .lean();
      
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching helpdesk ticket:', error);
    res.status(500).json({ error: 'Failed to fetch helpdesk ticket' });
  }
});

// Update ticket status, priority, or add a reply
router.post('/:id/update', withAdminAuth, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { status, priority, message } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }
    
    // Prepare update object
    const updateObj: any = {};
    if (status) updateObj.status = status;
    if (priority) updateObj.priority = priority;
    
    // Check if staff user exists in the session
    const userId = req.session.user.id;
    
    // Get the ticket
    const ticket = await HelpDeskTicket.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // If message is provided, add a response
    if (message) {
      const newResponse = {
        user: userId,
        message,
        isStaff: true,
        createdAt: new Date()
      };
      
      // Add response to the ticket
      if (!ticket.responses) {
        ticket.responses = [];
      }
      
      ticket.responses.push(newResponse);
    }
    
    // Update status and priority if provided
    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    
    // If status changed to "IN_PROGRESS" and no assignee, assign to current admin
    if (status === 'IN_PROGRESS' && !ticket.assignedTo) {
      ticket.assignedTo = userId;
    }
    
    // Save the updated ticket
    await ticket.save();
    
    // Fetch the updated ticket with populated fields
    const updatedTicket = await HelpDeskTicket.findById(ticketId)
      .populate('user', 'fullName email username')
      .populate('assignedTo', 'fullName email username')
      .populate('orderRef')
      .populate('productRef', 'name slug images')
      .populate({
        path: 'responses',
        populate: {
          path: 'user',
          select: 'fullName email username'
        }
      });
    
    res.json(updatedTicket);
  } catch (error) {
    console.error('Error updating helpdesk ticket:', error);
    res.status(500).json({ error: 'Failed to update helpdesk ticket' });
  }
});

// Create a new ticket (mostly used by customers, but admins can also create tickets)
router.post('/', withAdminAuth, async (req, res) => {
  try {
    const { subject, message, userId, priority, orderRef, productRef } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }
    
    // Create new ticket
    const newTicket = new HelpDeskTicket({
      user: userId || req.session.user.id,
      subject,
      message,
      status: 'OPEN',
      priority: priority || 'MEDIUM',
      orderRef: orderRef || null,
      productRef: productRef || null,
      responses: []
    });
    
    await newTicket.save();
    
    // Return the created ticket
    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Error creating helpdesk ticket:', error);
    res.status(500).json({ error: 'Failed to create helpdesk ticket' });
  }
});

// Assign a ticket to an admin
router.patch('/:id/assign', withAdminAuth, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { assignTo } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }
    
    if (!assignTo) {
      return res.status(400).json({ error: 'Assign to user ID is required' });
    }
    
    // Check if user exists and is an admin or support
    const adminUser = await User.findById(assignTo);
    if (!adminUser || !['ADMIN', 'SUPPORT'].includes(adminUser.role)) {
      return res.status(400).json({ error: 'Invalid admin user ID' });
    }
    
    // Update ticket
    const ticket = await HelpDeskTicket.findByIdAndUpdate(
      ticketId,
      { assignedTo: assignTo },
      { new: true }
    )
    .populate('user', 'fullName email username')
    .populate('assignedTo', 'fullName email username');
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json(ticket);
  } catch (error) {
    console.error('Error assigning helpdesk ticket:', error);
    res.status(500).json({ error: 'Failed to assign helpdesk ticket' });
  }
});

// Delete a helpdesk ticket
router.delete('/:id', withAdminAuth, async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }
    
    const ticket = await HelpDeskTicket.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    await HelpDeskTicket.findByIdAndDelete(ticketId);
    
    // Return success
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting helpdesk ticket:', error);
    res.status(500).json({ error: 'Failed to delete helpdesk ticket' });
  }
});

export default router;