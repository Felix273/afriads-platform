// controllers/paymentController.js
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const pool = require('../config/database');

class PaymentController {
  // Create a new payment
  async createPayment(req, res) {
    try {
      const { amount, currency, payment_method, description } = req.body;
      const userId = req.user.id;

      // Validation
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      if (!payment_method) {
        return res.status(400).json({ error: 'Payment method is required' });
      }

      // Create payment record
      const payment = await Payment.create({
        user_id: userId,
        amount,
        currency: currency || 'USD',
        payment_method,
        description,
        status: 'pending'
      });

      // Log activity
      await ActivityLog.logPayment(userId, payment.id, amount, req.ip);

      res.status(201).json({
        success: true,
        payment,
        message: 'Payment initiated successfully'
      });
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({ error: 'Failed to create payment' });
    }
  }

  // Get user's payments
  async getPayments(req, res) {
    try {
      const userId = req.user.id;
      const payments = await Payment.findByUserId(userId);

      res.json({
        success: true,
        payments,
        count: payments.length
      });
    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({ error: 'Failed to retrieve payments' });
    }
  }

  // Get payment by ID
  async getPaymentById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const payment = await Payment.findById(id);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      // Check ownership (or admin)
      if (payment.user_id !== userId && req.user.user_type !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({
        success: true,
        payment
      });
    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({ error: 'Failed to retrieve payment' });
    }
  }

  // Get payment statistics
  async getPaymentStats(req, res) {
    try {
      const userId = req.user.id;
      const { start_date, end_date } = req.query;

      const stats = await Payment.getStats(userId, start_date, end_date);

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Get payment stats error:', error);
      res.status(500).json({ error: 'Failed to retrieve payment statistics' });
    }
  }

  // Handle payment webhook (from Stripe, PayPal, etc.)
  async handleWebhook(req, res) {
    try {
      const { transaction_id, status, amount, metadata } = req.body;

      // Find payment by transaction ID
      const payment = await Payment.findByTransactionId(transaction_id);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      // Update payment status
      const updatedPayment = await Payment.updateStatus(
        payment.id,
        status,
        status === 'completed' ? new Date() : null
      );

      // If payment completed, update user balance
      if (status === 'completed') {
        await pool.query(
          'UPDATE users SET balance = balance + $1 WHERE id = $2',
          [payment.amount, payment.user_id]
        );

        // Send notification
        await Notification.notifyPaymentReceived(payment.user_id, payment.amount);

        // Log activity
        await ActivityLog.create({
          user_id: payment.user_id,
          action: 'payment_completed',
          entity_type: 'payment',
          entity_id: payment.id,
          description: `Payment completed: $${payment.amount}`,
          metadata: { amount: payment.amount, transaction_id }
        });
      }

      res.json({
        success: true,
        payment: updatedPayment
      });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  // Admin: Get all payments
  async getAllPayments(req, res) {
    try {
      // Check admin permission
      if (req.user.user_type !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { page = 1, limit = 50, status } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT p.*, u.email, u.company_name, u.user_type
        FROM payments p
        JOIN users u ON p.user_id = u.id
      `;
      const values = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` WHERE p.status = $${paramCount}`;
        values.push(status);
      }

      query += ` ORDER BY p.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
      values.push(limit, offset);

      const result = await pool.query(query, values);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM payments';
      if (status) {
        countQuery += ' WHERE status = $1';
      }
      const countResult = await pool.query(
        countQuery,
        status ? [status] : []
      );
      const totalCount = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        payments: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Get all payments error:', error);
      res.status(500).json({ error: 'Failed to retrieve payments' });
    }
  }
}

module.exports = new PaymentController();
