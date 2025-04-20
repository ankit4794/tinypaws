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

    const { id } = req.query;

    if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: 'Invalid page ID' });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return getCmsPage(req, res, id as string);
      case 'PUT':
        return updateCmsPage(req, res, id as string);
      case 'DELETE':
        return deleteCmsPage(req, res, id as string);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('CMS page API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Get a specific CMS page
async function getCmsPage(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const page = await CmsPage.findById(id);
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    return res.status(200).json(page);
  } catch (error) {
    console.error('Error fetching CMS page:', error);
    return res.status(500).json({ message: 'Failed to fetch page' });
  }
}

// Update a CMS page
async function updateCmsPage(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { title, slug, content, metaTitle, metaDescription, isPublished } = req.body;

    // Check if page exists
    const page = await CmsPage.findById(id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Check if the slug already exists (excluding the current page)
    if (slug !== page.slug) {
      const existingPage = await CmsPage.findOne({ slug, _id: { $ne: id } });
      if (existingPage) {
        return res.status(400).json({ message: 'A page with this slug already exists' });
      }
    }

    // Update page
    const updatedPage = await CmsPage.findByIdAndUpdate(
      id,
      {
        title,
        slug,
        content,
        metaTitle: metaTitle || title,
        metaDescription,
        isPublished,
        updatedAt: new Date(),
      },
      { new: true }
    );

    return res.status(200).json(updatedPage);
  } catch (error) {
    console.error('Error updating CMS page:', error);
    return res.status(500).json({ message: 'Failed to update page' });
  }
}

// Delete a CMS page
async function deleteCmsPage(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const deletedPage = await CmsPage.findByIdAndDelete(id);
    
    if (!deletedPage) {
      return res.status(404).json({ message: 'Page not found' });
    }

    return res.status(200).json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting CMS page:', error);
    return res.status(500).json({ message: 'Failed to delete page' });
  }
}