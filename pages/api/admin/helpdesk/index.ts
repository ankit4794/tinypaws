import { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin } from '@/middleware/auth';
import mongoose from 'mongoose';

// Since we don't have a helpdesk model yet, let's create a simple schema here
// In a real application, this would be in the models directory
const helpdeskSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['new', 'open', 'pending', 'resolved', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  department: {
    type: String,
    required: true,
    enum: ['general', 'sales', 'support', 'technical', 'billing'],
    default: 'general'
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  replies: [{
    message: { type: String, required: true },
    sentBy: { type: String, required: true, enum: ['customer', 'staff'] },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add the model to mongoose models if it doesn't exist
const Helpdesk = mongoose.models.Helpdesk || mongoose.model('Helpdesk', helpdeskSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check admin authorization
    try {
      await isAdmin(req, res);
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return getTickets(req, res);
      case 'POST':
        return createTicket(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Helpdesk API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get all helpdesk tickets
async function getTickets(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      status, 
      priority, 
      department, 
      search, 
      limit = 20, 
      page = 1 
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = {};

    // Apply filters if provided
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (department) {
      query.department = department;
    }

    // Apply search filter if provided
    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count for pagination
    const totalCount = await Helpdesk.countDocuments(query);
    
    // Get tickets with pagination
    const tickets = await Helpdesk.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('assignedTo', 'fullName email')
      .populate('customer.userId', 'fullName email mobile');

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

// Create a new helpdesk ticket
async function createTicket(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      customer, 
      subject, 
      message, 
      status, 
      priority, 
      department,
      assignedTo 
    } = req.body;

    // Generate a unique ticket ID
    const ticketId = `TKT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    // Create new ticket
    const newTicket = await Helpdesk.create({
      ticketId,
      customer,
      subject,
      message,
      status: status || 'new',
      priority: priority || 'medium',
      department: department || 'general',
      assignedTo: assignedTo || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json(newTicket);
  } catch (error) {
    console.error('Error creating helpdesk ticket:', error);
    return res.status(500).json({ message: 'Failed to create ticket' });
  }
}