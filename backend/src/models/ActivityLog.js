// models/ActivityLog.js
const pool = require('../config/database');

class ActivityLog {
  static async create(logData) {
    const {
      user_id,
      action,
      entity_type,
      entity_id,
      description,
      ip_address,
      user_agent,
      metadata
    } = logData;

    const query = `
      INSERT INTO activity_logs (
        user_id, action, entity_type, entity_id,
        description, ip_address, user_agent, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      user_id, action, entity_type, entity_id,
      description, ip_address, user_agent,
      metadata ? JSON.stringify(metadata) : null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId, limit = 100) {
    const result = await pool.query(
      `SELECT * FROM activity_logs 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  static async findByAction(action, limit = 100) {
    const result = await pool.query(
      `SELECT al.*, u.email, u.user_type 
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.action = $1 
       ORDER BY al.created_at DESC 
       LIMIT $2`,
      [action, limit]
    );
    return result.rows;
  }

  static async findByEntity(entityType, entityId, limit = 50) {
    const result = await pool.query(
      `SELECT al.*, u.email, u.user_type 
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.entity_type = $1 AND al.entity_id = $2
       ORDER BY al.created_at DESC 
       LIMIT $3`,
      [entityType, entityId, limit]
    );
    return result.rows;
  }

  static async getRecentActivity(limit = 50) {
    const result = await pool.query(
      `SELECT al.*, u.email, u.user_type, u.company_name
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  static async deleteOld(days = 90) {
    const query = `
      DELETE FROM activity_logs
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '${days} days'
    `;
    const result = await pool.query(query);
    return result.rowCount;
  }

  // Action type helpers
  static async logLogin(userId, ipAddress, userAgent) {
    return this.create({
      user_id: userId,
      action: 'login',
      description: 'User logged in',
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  static async logCampaignCreate(userId, campaignId, campaignName, ipAddress) {
    return this.create({
      user_id: userId,
      action: 'create_campaign',
      entity_type: 'campaign',
      entity_id: campaignId,
      description: `Created campaign: ${campaignName}`,
      ip_address: ipAddress
    });
  }

  static async logCampaignUpdate(userId, campaignId, changes, ipAddress) {
    return this.create({
      user_id: userId,
      action: 'update_campaign',
      entity_type: 'campaign',
      entity_id: campaignId,
      description: 'Updated campaign',
      ip_address: ipAddress,
      metadata: changes
    });
  }

  static async logPayment(userId, paymentId, amount, ipAddress) {
    return this.create({
      user_id: userId,
      action: 'payment',
      entity_type: 'payment',
      entity_id: paymentId,
      description: `Payment made: $${amount}`,
      ip_address: ipAddress,
      metadata: { amount }
    });
  }

  static async logPayoutRequest(userId, payoutId, amount, ipAddress) {
    return this.create({
      user_id: userId,
      action: 'request_payout',
      entity_type: 'payout',
      entity_id: payoutId,
      description: `Payout requested: $${amount}`,
      ip_address: ipAddress,
      metadata: { amount }
    });
  }
}

module.exports = ActivityLog;
