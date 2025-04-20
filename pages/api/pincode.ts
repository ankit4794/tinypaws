import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db-connect';
import { ServiceablePincode } from '@/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { pincode } = req.query;
    
    if (!pincode) {
      return res.status(400).json({ message: 'Pincode is required' });
    }
    
    // Find the pincode
    const serviceablePincode = await ServiceablePincode.findOne({ pincode });
    
    // If pincode is found, it's serviceable
    if (serviceablePincode) {
      return res.status(200).json({
        pincode,
        isServiceable: true,
        deliveryCharge: serviceablePincode.deliveryCharge,
        deliveryTime: serviceablePincode.deliveryTime,
        areaName: serviceablePincode.areaName,
        city: serviceablePincode.city,
        state: serviceablePincode.state,
      });
    }
    
    // If pincode is not found, it's not serviceable
    return res.status(200).json({
      pincode,
      isServiceable: false,
      message: 'Delivery is not available to this pincode',
    });
  } catch (error) {
    console.error('Pincode API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}