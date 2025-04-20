import express from 'express';
import { z } from 'zod';
import { storageProvider } from '../index';
import mailgun from 'mailgun-js';

const router = express.Router();

// Validation schema for newsletter subscription
const subscribeSchema = z.object({
  email: z.string().email({ message: "Please provide a valid email address" }),
  name: z.string().optional(),
  preferences: z.array(z.string()).optional(),
});

// Validation schema for newsletter unsubscription
const unsubscribeSchema = z.object({
  email: z.string().email({ message: "Please provide a valid email address" }),
  reason: z.string().optional(),
});

// Configure Mailgun if credentials are available
const mailgunDomain = process.env.MAILGUN_DOMAIN;
const mailgunApiKey = process.env.MAILGUN_API_KEY;
let mg: mailgun.Mailgun | null = null;

if (mailgunDomain && mailgunApiKey) {
  mg = mailgun({ apiKey: mailgunApiKey, domain: mailgunDomain });
}

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    // Validate request body
    const validatedData = subscribeSchema.parse(req.body);
    
    // Check if already subscribed
    const existingSubscriber = await storageProvider.instance.getNewsletterSubscriberByEmail(validatedData.email);
    
    if (existingSubscriber) {
      // If already subscribed but marked as unsubscribed, update status
      if (existingSubscriber.isActive === false) {
        const updatedSubscriber = await storageProvider.instance.updateNewsletterSubscriber(
          existingSubscriber._id,
          { isActive: true }
        );
        
        return res.status(200).json({
          message: "You have been successfully re-subscribed to our newsletter",
          subscriber: updatedSubscriber
        });
      }
      
      // Already subscribed and active
      return res.status(200).json({
        message: "You are already subscribed to our newsletter",
        subscriber: existingSubscriber
      });
    }
    
    // Create a new subscriber
    const newSubscriber = await storageProvider.instance.createNewsletterSubscriber({
      email: validatedData.email,
      name: validatedData.name,
      preferences: validatedData.preferences,
      isActive: true,
      subscribedAt: new Date()
    });
    
    // If Mailgun is configured, send welcome email
    if (mg) {
      const data = {
        from: `TinyPaws <noreply@${mailgunDomain}>`,
        to: validatedData.email,
        subject: 'Welcome to TinyPaws Newsletter',
        text: `Hello ${validatedData.name || 'there'},\n\nThank you for subscribing to our newsletter! You'll now receive the latest updates on pet products, exclusive offers, and helpful pet care tips.\n\nIf you have any questions, feel free to contact our support team.\n\nBest regards,\nTeam TinyPaws`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to TinyPaws Newsletter!</h2>
            <p>Hello ${validatedData.name || 'there'},</p>
            <p>Thank you for subscribing to our newsletter! You'll now receive the latest updates on pet products, exclusive offers, and helpful pet care tips.</p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br>Team TinyPaws</p>
            <hr>
            <p style="font-size: 12px; color: #777;">
              You're receiving this email because you subscribed to TinyPaws newsletter.
              If you believe this is a mistake, you can <a href="https://www.tinypaws.in/unsubscribe?email=${encodeURIComponent(validatedData.email)}">unsubscribe here</a>.
            </p>
          </div>
        `
      };
      
      try {
        await mg.messages().send(data);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Continue execution even if email sending fails
      }
    }
    
    res.status(201).json({
      message: "Successfully subscribed to newsletter",
      subscriber: newSubscriber
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid data",
        errors: error.errors
      });
    }
    
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({ message: 'Failed to subscribe to newsletter' });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    // Validate request body
    const validatedData = unsubscribeSchema.parse(req.body);
    
    // Check if subscriber exists
    const existingSubscriber = await storageProvider.instance.getNewsletterSubscriberByEmail(validatedData.email);
    
    if (!existingSubscriber) {
      return res.status(404).json({ message: "Email not found in our subscriber list" });
    }
    
    // Update subscriber to inactive
    const updatedSubscriber = await storageProvider.instance.updateNewsletterSubscriber(
      existingSubscriber._id,
      { 
        isActive: false, 
        unsubscribedAt: new Date(),
        unsubscribeReason: validatedData.reason
      }
    );
    
    res.status(200).json({
      message: "Successfully unsubscribed from newsletter",
      subscriber: updatedSubscriber
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid data",
        errors: error.errors
      });
    }
    
    console.error('Error unsubscribing from newsletter:', error);
    res.status(500).json({ message: 'Failed to unsubscribe from newsletter' });
  }
});

// Verify subscription (used for double opt-in if implemented)
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Check if token is valid
    const subscriber = await storageProvider.instance.verifyNewsletterSubscription(token);
    
    if (!subscriber) {
      return res.status(404).json({ message: "Invalid or expired verification token" });
    }
    
    res.status(200).json({
      message: "Email verified successfully. Your subscription is now active.",
      subscriber
    });
  } catch (error) {
    console.error('Error verifying subscription:', error);
    res.status(500).json({ message: 'Failed to verify subscription' });
  }
});

// Check subscription status
router.get('/status', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: "Email parameter is required" });
    }
    
    const subscriber = await storageProvider.instance.getNewsletterSubscriberByEmail(email);
    
    if (!subscriber) {
      return res.status(404).json({ subscribed: false });
    }
    
    res.status(200).json({
      subscribed: subscriber.isActive,
      subscribedAt: subscriber.subscribedAt,
      preferences: subscriber.preferences
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({ message: 'Failed to check subscription status' });
  }
});

export default router;