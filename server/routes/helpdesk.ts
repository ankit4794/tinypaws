import express from 'express';
import { z } from 'zod';
import { storageProvider } from '../index';
import { isAuthenticated } from '../auth';

const router = express.Router();

// Schema for creating a ticket
const ticketSchema = z.object({
  subject: z.string().min(3, { message: "Subject must be at least 3 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
  priority: z.enum(['low', 'medium', 'high']),
  type: z.enum(['inquiry', 'support', 'complaint', 'feedback', 'order', 'return']),
  orderId: z.string().optional(),
});

// Schema for contact form submission
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please provide a valid email" }),
  phone: z.string().regex(/^\d{10}$/, { message: "Please provide a valid 10-digit phone number" }),
  subject: z.string().min(2, { message: "Subject must be at least 2 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
  contactMethod: z.enum(['email', 'phone', 'whatsapp']),
  orderId: z.string().optional(),
});

// Get all tickets for the authenticated user
router.get('/tickets', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user._id.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const filter: { userId: string; status?: string } = { userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const tickets = await storageProvider.instance.getHelpdeskTickets(filter, page, limit);
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching helpdesk tickets:', error);
    res.status(500).json({ message: 'Failed to fetch helpdesk tickets' });
  }
});

// Get a single ticket by ID
router.get('/tickets/:id', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user._id.toString();
    const ticketId = req.params.id;

    const ticket = await storageProvider.instance.getHelpdeskTicketById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if the ticket belongs to the authenticated user (unless user is admin)
    if (ticket.userId.toString() !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching helpdesk ticket:', error);
    res.status(500).json({ message: 'Failed to fetch helpdesk ticket' });
  }
});

// Create a new ticket
router.post('/tickets', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user._id.toString();
    
    // Validate the request body
    const validatedData = ticketSchema.parse(req.body);
    
    // Create the ticket
    const ticket = await storageProvider.instance.createHelpdeskTicket({
      userId,
      subject: validatedData.subject,
      message: validatedData.message,
      priority: validatedData.priority,
      type: validatedData.type,
      orderId: validatedData.orderId,
      status: 'open', // Default status for new tickets
    });

    res.status(201).json(ticket);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid form data', 
        errors: error.errors 
      });
    }
    
    console.error('Error creating helpdesk ticket:', error);
    res.status(500).json({ message: 'Failed to create helpdesk ticket' });
  }
});

// Submit a contact form (creates a ticket without requiring authentication)
router.post('/contact', async (req, res) => {
  try {
    // Validate the request body
    const validatedData = contactFormSchema.parse(req.body);
    
    // Create a helpdesk ticket from the contact form
    const ticket = await storageProvider.instance.createContactSubmission({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      subject: validatedData.subject,
      message: validatedData.message,
      contactMethod: validatedData.contactMethod,
      orderId: validatedData.orderId,
    });

    res.status(201).json({ 
      message: 'Contact form submitted successfully',
      ticketId: ticket._id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid form data', 
        errors: error.errors 
      });
    }
    
    console.error('Error processing contact form:', error);
    res.status(500).json({ message: 'Failed to process contact form' });
  }
});

// Add a reply to an existing ticket
router.post('/tickets/:id/replies', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userId = req.user._id.toString();
    const ticketId = req.params.id;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length < 2) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    // Get the ticket to check ownership
    const ticket = await storageProvider.instance.getHelpdeskTicketById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if the ticket belongs to the authenticated user (unless user is admin)
    if (ticket.userId.toString() !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add the reply
    const updatedTicket = await storageProvider.instance.addHelpdeskTicketReply(ticketId, {
      userId,
      message,
      isStaff: req.user.role === 'ADMIN',
    });

    res.status(201).json(updatedTicket);
  } catch (error) {
    console.error('Error adding reply to helpdesk ticket:', error);
    res.status(500).json({ message: 'Failed to add reply to helpdesk ticket' });
  }
});

export default router;