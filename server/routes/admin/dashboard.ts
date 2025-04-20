import express from 'express';
import { storageProvider } from '../../index';
import { requireAdmin } from '../../middleware/admin-auth';
import { v4 as uuidv4 } from 'uuid';
import { WidgetType, WidgetSize } from '@shared/schema';

const router = express.Router();

// Middleware to check admin authentication
router.use(requireAdmin);

// Get dashboard configuration
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let dashboardConfig = await storageProvider.instance.getDashboardConfig(userId);
    
    // If no dashboard config exists, create a default one
    if (!dashboardConfig) {
      // Create default widgets
      const defaultWidgets = [
        {
          id: uuidv4(),
          type: WidgetType.SALES_SUMMARY,
          title: 'Sales Summary',
          size: WidgetSize.MEDIUM,
          position: { x: 0, y: 0, w: 6, h: 2 },
          isVisible: true
        },
        {
          id: uuidv4(),
          type: WidgetType.RECENT_ORDERS,
          title: 'Recent Orders',
          size: WidgetSize.MEDIUM,
          position: { x: 6, y: 0, w: 6, h: 2 },
          isVisible: true
        },
        {
          id: uuidv4(),
          type: WidgetType.LOW_STOCK,
          title: 'Low Stock Products',
          size: WidgetSize.SMALL,
          position: { x: 0, y: 2, w: 4, h: 2 },
          isVisible: true
        },
        {
          id: uuidv4(),
          type: WidgetType.TOP_PRODUCTS,
          title: 'Top Products',
          size: WidgetSize.SMALL,
          position: { x: 4, y: 2, w: 4, h: 2 },
          isVisible: true
        },
        {
          id: uuidv4(),
          type: WidgetType.ORDER_STATUS,
          title: 'Order Status',
          size: WidgetSize.SMALL,
          position: { x: 8, y: 2, w: 4, h: 2 },
          isVisible: true
        }
      ];
      
      dashboardConfig = await storageProvider.instance.createDashboardConfig({
        userId,
        widgets: defaultWidgets,
        lastModified: new Date()
      });
    }

    res.json(dashboardConfig);
  } catch (error) {
    console.error('Error fetching dashboard config:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard configuration' });
  }
});

// Get dashboard configuration for the current user
router.get('/config', async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let dashboardConfig = await storageProvider.instance.getDashboardConfig(userId);
    
    // If no dashboard config exists, create a default one
    if (!dashboardConfig) {
      // Create default widgets
      const defaultWidgets = [
        {
          id: uuidv4(),
          type: WidgetType.SALES_SUMMARY,
          title: 'Sales Summary',
          position: { x: 0, y: 0, w: 6, h: 4 },
          isVisible: true
        },
        {
          id: uuidv4(),
          type: WidgetType.RECENT_ORDERS,
          title: 'Recent Orders',
          position: { x: 6, y: 0, w: 6, h: 4 },
          isVisible: true
        },
        {
          id: uuidv4(),
          type: WidgetType.LOW_STOCK,
          title: 'Low Stock Products',
          position: { x: 0, y: 4, w: 6, h: 4 },
          isVisible: true
        },
        {
          id: uuidv4(),
          type: WidgetType.TOP_PRODUCTS,
          title: 'Top Products',
          position: { x: 6, y: 4, w: 6, h: 4 },
          isVisible: true
        },
        {
          id: uuidv4(),
          type: WidgetType.ORDER_STATUS,
          title: 'Order Status',
          position: { x: 0, y: 8, w: 4, h: 4 },
          isVisible: true
        }
      ];
      
      dashboardConfig = await storageProvider.instance.createDashboardConfig({
        userId,
        widgets: defaultWidgets,
        lastModified: new Date()
      });
    }

    res.json(dashboardConfig);
  } catch (error) {
    console.error('Error fetching dashboard config:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard configuration' });
  }
});

// Update widget positions
router.patch('/widget-positions', async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { widgets } = req.body;
    if (!widgets || !Array.isArray(widgets)) {
      return res.status(400).json({ error: 'Invalid widget data' });
    }

    const updatedConfig = await storageProvider.instance.updateWidgetPositions(userId, widgets);
    if (!updatedConfig) {
      return res.status(404).json({ error: 'Dashboard configuration not found' });
    }

    res.json(updatedConfig);
  } catch (error) {
    console.error('Error updating widget positions:', error);
    res.status(500).json({ error: 'Failed to update widget positions' });
  }
});

// Toggle widget visibility
router.patch('/widget-visibility', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { widgetId, isVisible } = req.body;
    if (!widgetId || typeof isVisible !== 'boolean') {
      return res.status(400).json({ error: 'Invalid widget data' });
    }

    const updatedConfig = await storageProvider.instance.toggleWidgetVisibility(userId, widgetId, isVisible);
    if (!updatedConfig) {
      return res.status(404).json({ error: 'Dashboard configuration not found' });
    }

    res.json(updatedConfig);
  } catch (error) {
    console.error('Error toggling widget visibility:', error);
    res.status(500).json({ error: 'Failed to toggle widget visibility' });
  }
});

// Update dashboard configuration
router.put('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { widgets } = req.body;
    if (!widgets || !Array.isArray(widgets)) {
      return res.status(400).json({ error: 'Invalid dashboard data' });
    }

    const updatedConfig = await storageProvider.instance.updateDashboardConfig(userId, { widgets });
    if (!updatedConfig) {
      return res.status(404).json({ error: 'Dashboard configuration not found' });
    }

    res.json(updatedConfig);
  } catch (error) {
    console.error('Error updating dashboard config:', error);
    res.status(500).json({ error: 'Failed to update dashboard configuration' });
  }
});

export default router;