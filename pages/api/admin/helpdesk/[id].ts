import { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin } from '@/middleware/auth';
import mongoose from 'mongoose';

// Reference the Helpdesk model
const Helpdesk = mongoose.models.Helpdesk;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check admin authorization
    try {
      await isAdmin(req, res);
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;

    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: 'Invalid ticket ID' });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return getTicket(req, res, id as string);
      case 'PUT':
        return updateTicket(req, res, id as string);
      case 'DELETE':
        return deleteTicket(req, res, id as string);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Helpdesk ticket API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get a specific helpdesk ticket
async function getTicket(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const ticket = await Helpdesk.findById(id)
      .populate('assignedTo', 'fullName email')
      .populate('customer.userId', 'fullName email mobile');
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    return res.status(200).json(ticket);
  } catch (error) {
    console.error('Error fetching helpdesk ticket:', error);
    return res.status(500).json({ message: 'Failed to fetch ticket' });
  }
}

// Update a helpdesk ticket
async function updateTicket(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const {
      status,
      priority,
      department,
      assignedTo,
      reply
    } = req.body;

    // Check if ticket exists
    const ticket = await Helpdesk.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Update basic fields
    const updateData: any = {
      updatedAt: new Date()
    };

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (department) updateData.department = department;
    if (assignedTo) updateData.assignedTo = assignedTo;

    // Add reply if provided
    if (reply && reply.message) {
      const newReply = {
        message: reply.message,
        sentBy: 'staff',
        staffId: req.session.user._id,
        timestamp: new Date()
      };

      // Push to replies array
      await Helpdesk.findByIdAndUpdate(
        id,
        { $push: { replies: newReply } },
        { new: true }
      );
    }

    // Update ticket
    const updatedTicket = await Helpdesk.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    .populate('assignedTo', 'fullName email')
    .populate('customer.userId', 'fullName email mobile');

    return res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('Error updating helpdesk ticket:', error);
    return res.status(500).json({ message: 'Failed to update ticket' });
  }
}

// Delete a helpdesk ticket
async function deleteTicket(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const deletedTicket = await Helpdesk.findByIdAndDelete(id);
    
    if (!deletedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    return res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting helpdesk ticket:', error);
    return res.status(500).json({ message: 'Failed to delete ticket' });
  }
}