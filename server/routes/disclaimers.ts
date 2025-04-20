import { Router } from 'express';
import { storageProvider } from '../index';

const router = Router();

// Get all active disclaimers
router.get('/', async (req, res) => {
  try {
    const disclaimers = await storageProvider.instance.getActiveDisclaimers();
    res.json(disclaimers);
  } catch (error) {
    console.error('Error fetching disclaimers:', error);
    res.status(500).json({ error: 'Failed to fetch disclaimers' });
  }
});

// Get disclaimers by type
router.get('/type/:type', async (req, res) => {
  try {
    const type = req.params.type;
    const disclaimers = await storageProvider.instance.getDisclaimersByType(type);
    res.json(disclaimers);
  } catch (error) {
    console.error('Error fetching disclaimers by type:', error);
    res.status(500).json({ error: 'Failed to fetch disclaimers' });
  }
});

export default router;