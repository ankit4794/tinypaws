import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { isAdmin } from '@/middleware/auth';

// Create a Helpdesk Ticket model if it doesn't exist already in models
let HelpdeskTicket;
try {
  HelpdeskTicket = mongoose.model('HelpdeskTicket');
} catch {
  const helpdeskTicketSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['new', 'in-progress', 'resolved', 'closed'],
      default: 'new'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    replies: [{
      message: { type: String, required: true },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  HelpdeskTicket = mongoose.model('HelpdeskTicket', helpdeskTicketSchema);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify admin access
    try {
      await isAdmin(req, res);
    } catch (error) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Connect to MongoDB if needed
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URL!);
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return getTickets(req, res);
      case 'POST':
        return updateTicket(req, res);
      case 'DELETE':
        return deleteTicket(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin helpdesk API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get all tickets with pagination and filtering
async function getTickets(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    let query: any = {};
    let sortOption: any = {};

    // Apply filters
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    // Set up sort options
    if (sort) {
      const sortOrder = order === 'asc' ? 1 : -1;
      sortOption[sort as string] = sortOrder;
    }

    // Count total tickets for pagination
    const totalCount = await HelpdeskTicket.countDocuments(query);

    // Get tickets with pagination, populate assignedTo if present
    const tickets = await HelpdeskTicket.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('assignedTo', 'username email fullName')
      .populate('replies.createdBy', 'username email fullName');

    return res.status(200).json({
      tickets,
      pagination: {
        total: totalCount,
        page: Number(page),
        pageSize: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching helpdesk tickets:', error);
    return res.status(500).json({ message: 'Failed to fetch tickets' });
  }
}

// Update ticket (status, priority, add reply, assign)
async function updateTicket(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      ticketId,
      status,
      priority,
      assignedTo,
      reply
    } = req.body;

    if (!ticketId) {
      return res.status(400).json({ message: 'Ticket ID is required' });
    }

    // Get the current ticket
    const ticket = await HelpdeskTicket.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Update fields if provided
    if (status) {
      ticket.status = status;
    }
    
    if (priority) {
      ticket.priority = priority;
    }
    
    if (assignedTo) {
      ticket.assignedTo = assignedTo;
    }
    
    // Add reply if provided
    if (reply && reply.message) {
      ticket.replies.push({
        message: reply.message,
        createdBy: req.session?.user?.id,
        createdAt: new Date()
      });
    }
    
    // Update the updatedAt timestamp
    ticket.updatedAt = new Date();
    
    // Save the updated ticket
    await ticket.save();
    
    // Return the updated ticket with populated fields
    const updatedTicket = await HelpdeskTicket.findById(ticketId)
      .populate('assignedTo', 'username email fullName')
      .populate('replies.createdBy', 'username email fullName');
    
    return res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('Error updating helpdesk ticket:', error);
    return res.status(500).json({ message: 'Failed to update ticket' });
  }
}

// Delete a ticket
async function deleteTicket(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { ticketId } = req.body;

    if (!ticketId) {
      return res.status(400).json({ message: 'Ticket ID is required' });
    }

    // Delete the ticket
    const result = await HelpdeskTicket.findByIdAndDelete(ticketId);
    
    if (!result) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    return res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting helpdesk ticket:', error);
    return res.status(500).json({ message: 'Failed to delete ticket' });
  }
}