import { NextApiRequest, NextApiResponse } from 'next';
import { storageProvider } from '@/server/index';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import twilio from 'twilio';
import mailgun from 'mailgun-js';

// Initialize Twilio client for SMS
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN ? 
  twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

// Initialize Mailgun for email
const mg = process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN ? 
  mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN }) : null;

// JWT secret for OTP tokens
const JWT_SECRET = process.env.JWT_SECRET || 'tinypaws-jwt-secret-key-123';

// Validate schema for OTP request
const otpSchema = z.object({
  type: z.enum(['email', 'mobile']),
  value: z.string().min(1, 'Email or mobile number is required'),
});

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via SMS
async function sendSMSOTP(phone: string, otp: string): Promise<boolean> {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.error('Twilio client not initialized. Cannot send SMS OTP.');
    return false;
  }

  try {
    await twilioClient.messages.create({
      body: `Your TinyPaws verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    return true;
  } catch (error) {
    console.error('Error sending SMS OTP:', error);
    return false;
  }
}

// Send OTP via Email
async function sendEmailOTP(email: string, otp: string): Promise<boolean> {
  if (!mg) {
    console.error('Mailgun client not initialized. Cannot send Email OTP.');
    return false;
  }

  try {
    const data = {
      from: 'TinyPaws <no-reply@tinypaws.in>',
      to: email,
      subject: 'Your Verification Code',
      text: `Your TinyPaws verification code is: ${otp}`,
      html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
          <h2 style="color: #333;">TinyPaws Verification</h2>
          <p>Please use the following code to verify your account:</p>
          <div style="background-color: #f8f8f8; padding: 15px; border-radius: 4px; font-size: 24px; letter-spacing: 5px; text-align: center; font-weight: bold;">
            ${otp}
          </div>
          <p style="margin-top: 20px; font-size: 14px; color: #777;">This code will expire in 10 minutes.</p>
          <p style="font-size: 14px; color: #777;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    await mg.messages().send(data);
    return true;
  } catch (error) {
    console.error('Error sending Email OTP:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validatedData = otpSchema.parse(req.body);
    const { type, value } = validatedData;

    // Initialize storage if needed
    if (!storageProvider.instance) {
      await storageProvider.initialize();
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Create JWT token with OTP (expires in 10 minutes)
    const token = jwt.sign(
      { 
        otp, 
        type,
        value,
        createdAt: new Date().toISOString(),
      }, 
      JWT_SECRET, 
      { expiresIn: '10m' }
    );

    // Store token in session
    req.session.otpToken = token;
    await req.session.save();

    // Send OTP based on type
    let otpSent = false;
    if (type === 'mobile') {
      otpSent = await sendSMSOTP(value, otp);
    } else if (type === 'email') {
      otpSent = await sendEmailOTP(value, otp);
    }

    if (!otpSent) {
      return res.status(500).json({ message: `Failed to send OTP to ${type}` });
    }

    return res.status(200).json({ 
      message: `OTP sent to your ${type}`,
      otpSent: true
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    if (error.errors) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
}