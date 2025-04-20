import { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin } from '@/middleware/auth';
import mongoose from 'mongoose';
import { User } from '@/models';

// Reference the Helpdesk model
const Helpdesk = mongoose.models.Helpdesk;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only allow POST method
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Check admin authorization
    try {
      await isAdmin(req, res);
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { ticketId, message } = req.body;

    if (!ticketId || !mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ message: 'Invalid ticket ID' });
    }

    if (!message) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    // Get ticket and check if it exists
    const ticket = await Helpdesk.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Get admin user info
    const admin = await User.findById(req.session.user._id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    // Create new reply
    const newReply = {
      message,
      sentBy: 'staff',
      staffId: admin._id,
      timestamp: new Date()
    };

    // Add reply and update ticket
    const updatedTicket = await Helpdesk.findByIdAndUpdate(
      ticketId,
      {
        $push: { replies: newReply },
        status: ticket.status === 'new' ? 'open' : ticket.status,  // Change status from 'new' to 'open' if it's new
        updatedAt: new Date()
      },
      { new: true }
    )
    .populate('assignedTo', 'fullName email')
    .populate('customer.userId', 'fullName email mobile');

    // Optional: Send email notification to the customer
    // This would be implemented in a real application

    return res.status(200).json({
      message: 'Reply added successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Error adding reply to ticket:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}