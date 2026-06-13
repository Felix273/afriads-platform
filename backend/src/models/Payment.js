// models/Payment.js
const { pool } = require('../config/database');

class Payment {
  static async create(paymentData) {
    const {
      user_id,
      amount,
      currency = 'USD',
      payment_method,
      transaction_id,
      payment_gateway,
      description,
      metadata
    } = paymentData;

    const query = `
      INSERT INTO payments (
        user_id, amount, currency, payment_method,
        transaction_id, payment_gateway, status, description, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)
      RETURNING *
    `;

    const values = [
      user_id, amount, currency, payment_method,
      transaction_id, payment_gateway, description,
      metadata ? JSON.stringify(metadata) : null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async findByTransactionId(transactionId) {
    const result = await pool.query(
      'SELECT * FROM payments WHERE transaction_id = $1',
      [transactionId]
    );
    return result.rows[0];
  }

  static async findByMpesaRequest(merchantRequestId, checkoutRequestId) {
    const result = await pool.query(
      `SELECT * FROM payments
       WHERE payment_method = 'mpesa'
       AND (
         metadata->>'MerchantRequestID' = $1
         OR metadata->>'CheckoutRequestID' = $2
         OR metadata->'mpesa_response'->>'MerchantRequestID' = $1
         OR metadata->'mpesa_response'->>'CheckoutRequestID' = $2
       )
       ORDER BY created_at DESC
       LIMIT 1`,
      [merchantRequestId || null, checkoutRequestId || null]
    );
    return result.rows[0];
  }

  static async updateStatus(id, status, paid_at = null, metadata = null) {
    const query = `
      UPDATE payments 
      SET status = $1,
          paid_at = $2,
          metadata = CASE
            WHEN $3::JSONB IS NULL THEN metadata
            ELSE COALESCE(metadata, '{}'::JSONB) || $3::JSONB
          END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [
      status,
      paid_at,
      metadata ? JSON.stringify(metadata) : null,
      id
    ]);
    return result.rows[0];
  }

  static async getStats(userId, startDate = null, endDate = null) {
    let query = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_completed,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
        SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END) as total_failed
      FROM payments
      WHERE user_id = $1
    `;
    
    const values = [userId];
    
    if (startDate && endDate) {
      query += ' AND created_at BETWEEN $2 AND $3';
      values.push(startDate, endDate);
    }

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = Payment;
