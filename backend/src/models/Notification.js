// models/Notification.js
const pool = require('../config/database');

class Notification {
  static async create(notificationData) {
    const {
      user_id,
      type,
      title,
      message,
      data
    } = notificationData;

    const query = `
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      user_id, type, title, message,
      data ? JSON.stringify(data) : null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM notifications WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByUserId(userId, limit = 50) {
    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  static async getUnreadCount(userId) {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  static async markAsRead(id, userId) {
    const query = `
      UPDATE notifications 
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }

  static async markAllAsRead(userId) {
    const query = `
      UPDATE notifications 
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = false
      RETURNING COUNT(*) as updated_count
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async deleteOld(days = 30) {
    const query = `
      DELETE FROM notifications
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '${days} days'
      AND is_read = true
    `;
    const result = await pool.query(query);
    return result.rowCount;
  }

  // Notification type helpers
  static async notifyCampaignApproved(userId, campaignName) {
    return this.create({
      user_id: userId,
      type: 'campaign_approved',
      title: 'Campaign Approved',
      message: `Your campaign "${campaignName}" has been approved and is now active.`,
      data: { campaign_name: campaignName }
    });
  }

  static async notifyLowBudget(userId, campaignName, remainingBudget) {
    return this.create({
      user_id: userId,
      type: 'low_budget',
      title: 'Low Budget Alert',
      message: `Your campaign "${campaignName}" has only $${remainingBudget} remaining.`,
      data: { campaign_name: campaignName, remaining_budget: remainingBudget }
    });
  }

  static async notifyPayoutProcessed(userId, amount) {
    return this.create({
      user_id: userId,
      type: 'payout_processed',
      title: 'Payout Processed',
      message: `Your payout of $${amount} has been processed successfully.`,
      data: { amount }
    });
  }

  static async notifyPaymentReceived(userId, amount) {
    return this.create({
      user_id: userId,
      type: 'payment_received',
      title: 'Payment Received',
      message: `Your payment of $${amount} has been received and added to your balance.`,
      data: { amount }
    });
  }
}

module.exports = Notification;
