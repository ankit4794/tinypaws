import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db-connect';
import { ServiceablePincode } from '@/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Group pincodes by area and get delivery charges
    const areas = await ServiceablePincode.aggregate([
      {
        $group: {
          _id: '$areaName',
          areaName: { $first: '$areaName' },
          city: { $first: '$city' },
          state: { $first: '$state' },
          deliveryCharge: { $first: '$deliveryCharge' },
          deliveryTime: { $first: '$deliveryTime' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { areaName: 1 }
      }
    ]);
    
    return res.status(200).json(areas);
  } catch (error) {
    console.error('Shipping areas API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}