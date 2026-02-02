// models/Payout.js
const pool = require('../config/database');

class Payout {
  static async create(payoutData) {
    const {
      publisher_id,
      amount,
      currency = 'USD',
      payout_method,
      account_details,
      description
    } = payoutData;

    const query = `
      INSERT INTO payouts (
        publisher_id, amount, currency, payout_method,
        account_details, status, description, requested_at
      )
      VALUES ($1, $2, $3, $4, $5, 'pending', $6, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      publisher_id, amount, currency, payout_method,
      account_details ? JSON.stringify(account_details) : null,
      description
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM payouts WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByPublisherId(publisherId) {
    const result = await pool.query(
      'SELECT * FROM payouts WHERE publisher_id = $1 ORDER BY requested_at DESC',
      [publisherId]
    );
    return result.rows;
  }

  static async updateStatus(id, status, transaction_id = null) {
    let query = `
      UPDATE payouts 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
    `;
    const values = [status];
    let paramCount = 1;

    if (status === 'processing') {
      paramCount++;
      query += `, processed_at = CURRENT_TIMESTAMP`;
    }

    if (status === 'completed') {
      paramCount++;
      query += `, completed_at = CURRENT_TIMESTAMP`;
    }

    if (transaction_id) {
      paramCount++;
      query += `, transaction_id = $${paramCount}`;
      values.push(transaction_id);
    }

    paramCount++;
    query += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getPendingPayouts() {
    const result = await pool.query(
      `SELECT p.*, u.email, u.company_name 
       FROM payouts p
       JOIN users u ON p.publisher_id = u.id
       WHERE p.status = 'pending'
       ORDER BY p.requested_at ASC`
    );
    return result.rows;
  }

  static async getStats(publisherId, startDate = null, endDate = null) {
    let query = `
      SELECT 
        COUNT(*) as total_payouts,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
        SUM(CASE WHEN status = 'processing' THEN amount ELSE 0 END) as total_processing
      FROM payouts
      WHERE publisher_id = $1
    `;
    
    const values = [publisherId];
    
    if (startDate && endDate) {
      query += ' AND requested_at BETWEEN $2 AND $3';
      values.push(startDate, endDate);
    }

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getMinimumPayoutAmount() {
    return 50.00; // Minimum $50 for payout
  }
}

module.exports = Payout;
