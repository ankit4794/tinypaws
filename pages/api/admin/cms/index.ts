import { NextApiRequest, NextApiResponse } from 'next';
import { isAdmin } from '@/middleware/auth';
import { CmsPage } from '@/models';
import mongoose from 'mongoose';

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
        return getCmsPages(req, res);
      case 'POST':
        return createCmsPage(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('CMS pages API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get all CMS pages
async function getCmsPages(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { search, limit = 20, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = {};

    // Apply search filter if provided
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { slug: { $regex: search, $options: 'i' } },
        ],
      };
    }

    // Get total count for pagination
    const totalCount = await CmsPage.countDocuments(query);
    
    // Get pages with pagination
    const pages = await CmsPage.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      pages,
      pagination: {
        total: totalCount,
        page: Number(page),
        pageSize: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching CMS pages:', error);
    return res.status(500).json({ message: 'Failed to fetch CMS pages' });
  }
}

// Create a new CMS page
async function createCmsPage(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { title, slug, content, metaTitle, metaDescription, isPublished } = req.body;

    // Check if the slug already exists
    const existingPage = await CmsPage.findOne({ slug });
    if (existingPage) {
      return res.status(400).json({ message: 'A page with this slug already exists' });
    }

    // Create new page
    const newPage = await CmsPage.create({
      title,
      slug,
      content,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || '',
      isPublished: isPublished !== undefined ? isPublished : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json(newPage);
  } catch (error) {
    console.error('Error creating CMS page:', error);
    return res.status(500).json({ message: 'Failed to create CMS page' });
  }
}