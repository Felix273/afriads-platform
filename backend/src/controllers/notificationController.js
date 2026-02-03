// controllers/notificationController.js
const Notification = require('../models/Notification');

class NotificationController {
  // Get user's notifications
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 50, unread_only } = req.query;

      let notifications = await Notification.findByUserId(userId, parseInt(limit));

      // Filter for unread only if requested
      if (unread_only === 'true') {
        notifications = notifications.filter(n => !n.is_read);
      }

      res.json({
        success: true,
        notifications,
        count: notifications.length
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Failed to retrieve notifications' });
    }
  }

  // Get unread count
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await Notification.getUnreadCount(userId);

      res.json({
        success: true,
        unread_count: count
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: 'Failed to retrieve unread count' });
    }
  }

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await Notification.markAsRead(id, userId);

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json({
        success: true,
        notification,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      const result = await Notification.markAllAsRead(userId);

      res.json({
        success: true,
        updated_count: result.updated_count,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  }

  // Delete a notification
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Find notification first
      const notification = await Notification.findById(id);

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      // Check ownership
      if (notification.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Delete notification
      const pool = require('../config/database');
      await pool.query('DELETE FROM notifications WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  }
}

module.exports = new NotificationController();
