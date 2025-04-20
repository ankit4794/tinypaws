import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db-connect';
import { Order } from '@/models';
import { isAdmin } from '@/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  
  // Ensure the requester is an admin
  await isAdmin(req, res);
  
  try {
    switch (req.method) {
      case 'GET':
        // Query parameters for filtering
        const { 
          status, 
          from, 
          to, 
          search, 
          sort = 'createdAt', 
          order = 'desc',
          limit = 100,
          page = 1
        } = req.query;
        
        // Build query
        let query: any = {};
        
        // Filter by status
        if (status && status !== 'all') {
          query.status = status;
        }
        
        // Filter by date range
        if (from || to) {
          query.createdAt = {};
          if (from) query.createdAt.$gte = new Date(from as string);
          if (to) {
            const toDate = new Date(to as string);
            toDate.setHours(23, 59, 59, 999); // End of day
            query.createdAt.$lte = toDate;
          }
        }
        
        // Search by order number, email, phone, or name
        if (search) {
          const searchRegex = new RegExp(search as string, 'i');
          query.$or = [
            { orderNumber: searchRegex },
            { email: searchRegex },
            { mobile: searchRegex },
            { fullName: searchRegex }
          ];
        }
        
        // Calculate skip for pagination
        const skip = (Number(page) - 1) * Number(limit);
        
        // Get orders with pagination
        const orders = await Order.find(query)
          .sort({ [sort as string]: order === 'desc' ? -1 : 1 })
          .skip(skip)
          .limit(Number(limit))
          .populate({
            path: 'items',
            populate: {
              path: 'productId',
              select: 'name slug image'
            }
          });
        
        // Get total count for pagination
        const total = await Order.countDocuments(query);
        
        return res.status(200).json({
          orders,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
          }
        });
        
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin orders API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}