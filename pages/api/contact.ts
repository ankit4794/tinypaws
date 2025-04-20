import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';

// Create a Contact Submission model if it doesn't exist already in models
let ContactSubmission;
try {
  ContactSubmission = mongoose.model('ContactSubmission');
} catch {
  const contactSubmissionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    phone: { type: String },
    status: { 
      type: String, 
      enum: ['new', 'read', 'responded', 'spam'],
      default: 'new'
    },
    createdAt: { type: Date, default: Date.now }
  });
  
  ContactSubmission = mongoose.model('ContactSubmission', contactSubmissionSchema);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to MongoDB if needed
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URL!);
    }

    // Only allow POST methods for contact form submissions
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Submit contact form
    return submitContactForm(req, res);
  } catch (error) {
    console.error('Contact form submission API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Submit contact form
async function submitContactForm(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, email, subject, message, phone } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: name, email, subject, and message' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Create contact submission
    const contactSubmission = new ContactSubmission({
      name,
      email,
      subject,
      message,
      phone: phone || '',
      status: 'new',
      createdAt: new Date()
    });

    // Save to database
    await contactSubmission.save();
    
    // Send notification email to admin (implementation would be here)
    // This is where you would use Mailgun or another email service
    
    return res.status(201).json({ 
      message: 'Thank you for your message. We will get back to you soon.',
      success: true
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return res.status(500).json({ message: 'Failed to submit contact form' });
  }
}