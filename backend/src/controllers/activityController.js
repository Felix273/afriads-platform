// controllers/activityController.js
const ActivityLog = require('../models/ActivityLog');

class ActivityController {
  // Get user's activity logs
  async getUserActivity(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 100 } = req.query;

      const activities = await ActivityLog.findByUserId(userId, parseInt(limit));

      res.json({
        success: true,
        activities,
        count: activities.length
      });
    } catch (error) {
      console.error('Get user activity error:', error);
      res.status(500).json({ error: 'Failed to retrieve activity logs' });
    }
  }

  // Get activity for specific entity
  async getEntityActivity(req, res) {
    try {
      const { type, id } = req.params;
      const { limit = 50 } = req.query;

      const activities = await ActivityLog.findByEntity(type, parseInt(id), parseInt(limit));

      res.json({
        success: true,
        entity_type: type,
        entity_id: id,
        activities,
        count: activities.length
      });
    } catch (error) {
      console.error('Get entity activity error:', error);
      res.status(500).json({ error: 'Failed to retrieve entity activity' });
    }
  }

  // Admin: Get recent activity
  async getRecentActivity(req, res) {
    try {
      // Check admin permission
      if (req.user.user_type !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { limit = 100 } = req.query;
      const activities = await ActivityLog.getRecentActivity(parseInt(limit));

      res.json({
        success: true,
        activities,
        count: activities.length
      });
    } catch (error) {
      console.error('Get recent activity error:', error);
      res.status(500).json({ error: 'Failed to retrieve recent activity' });
    }
  }

  // Admin: Get activity by action type
  async getActivityByAction(req, res) {
    try {
      // Check admin permission
      if (req.user.user_type !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { action } = req.params;
      const { limit = 100 } = req.query;

      const activities = await ActivityLog.findByAction(action, parseInt(limit));

      res.json({
        success: true,
        action,
        activities,
        count: activities.length
      });
    } catch (error) {
      console.error('Get activity by action error:', error);
      res.status(500).json({ error: 'Failed to retrieve activity logs' });
    }
  }
}

module.exports = new ActivityController();
