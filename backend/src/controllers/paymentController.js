// controllers/paymentController.js
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { pool } = require('../config/database');
const {
  getMpesaConfig,
  getConfigStatus,
  assertConfigured,
  initiateSTKPush,
  normalizePhoneNumber,
  extractCallbackItems
} = require('../services/mpesaService');

const completePayment = async ({ payment, status, paidAt = null, metadata = {}, ipAddress = null }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const lockedResult = await client.query(
      'SELECT * FROM payments WHERE id = $1 FOR UPDATE',
      [payment.id]
    );

    if (lockedResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const lockedPayment = lockedResult.rows[0];
    const wasCompleted = lockedPayment.status === 'completed';

    const updatedResult = await client.query(
      `UPDATE payments
       SET status = $1,
           paid_at = COALESCE($2, paid_at),
           metadata = COALESCE(metadata, '{}'::JSONB) || $3::JSONB,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status, paidAt, JSON.stringify(metadata), lockedPayment.id]
    );

    const updatedPayment = updatedResult.rows[0];

    if (status === 'completed' && !wasCompleted) {
      await client.query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2',
        [lockedPayment.amount, lockedPayment.user_id]
      );
    }

    await client.query('COMMIT');

    if (status === 'completed' && !wasCompleted) {
      await Notification.notifyPaymentReceived(lockedPayment.user_id, lockedPayment.amount);

      await ActivityLog.create({
        user_id: lockedPayment.user_id,
        action: 'payment_completed',
        entity_type: 'payment',
        entity_id: lockedPayment.id,
        description: `Payment completed: $${lockedPayment.amount}`,
        ip_address: ipAddress,
        metadata
      });
    }

    return updatedPayment;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

class PaymentController {
  async getMpesaStatus(req, res) {
    try {
      const status = getConfigStatus();

      res.json({
        success: true,
        mpesa: status
      });
    } catch (error) {
      console.error('Get M-Pesa status error:', error);
      res.status(500).json({ error: 'Failed to retrieve M-Pesa status' });
    }
  }

  // Create a new payment
  async createPayment(req, res) {
    try {
      const { amount, currency, payment_method, description, phone_number } = req.body;
      const userId = req.user.id;

      // Validation
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      if (!payment_method) {
        return res.status(400).json({ error: 'Payment method is required' });
      }

      const normalizedMethod = payment_method.toLowerCase();
      const transactionId = `${normalizedMethod.toUpperCase()}-${Date.now()}-${userId}`;
      let mpesaResult = null;

      if (normalizedMethod === 'mpesa' && !normalizePhoneNumber(phone_number)) {
        return res.status(400).json({
          error: 'A valid Kenyan M-Pesa phone number is required, for example 254712345678'
        });
      }

      if (normalizedMethod === 'mpesa') {
        assertConfigured(getMpesaConfig());
      }

      // Create payment record
      const payment = await Payment.create({
        user_id: userId,
        amount,
        currency: normalizedMethod === 'mpesa' ? 'KES' : (currency || 'USD'),
        payment_method: normalizedMethod,
        transaction_id: transactionId,
        payment_gateway: normalizedMethod,
        description,
        metadata: normalizedMethod === 'mpesa' ? {
          account_reference: transactionId,
          phone_number: normalizePhoneNumber(phone_number),
          environment: process.env.MPESA_ENVIRONMENT || 'sandbox'
        } : null,
        status: 'pending'
      });

      if (normalizedMethod === 'mpesa') {
        try {
          mpesaResult = await initiateSTKPush({
            amount,
            phoneNumber: phone_number,
            accountReference: transactionId,
            transactionDescription: description || 'AfriAds wallet top up'
          });
        } catch (mpesaError) {
          const mpesaErrorData = mpesaError.response?.data || null;
          await Payment.updateStatus(payment.id, 'failed', null, {
            mpesa_initiation_error: mpesaErrorData || mpesaError.message
          });

          return res.status(mpesaError.response?.status || mpesaError.statusCode || 502).json({
            success: false,
            error: mpesaErrorData?.errorMessage || mpesaError.message || 'Failed to initiate M-Pesa payment',
            payment_id: payment.id,
            mpesa_error: mpesaErrorData
          });
        }

        await Payment.updateStatus(payment.id, 'pending', null, {
          mpesa_request: mpesaResult.request,
          mpesa_response: mpesaResult.response,
          MerchantRequestID: mpesaResult.response.MerchantRequestID,
          CheckoutRequestID: mpesaResult.response.CheckoutRequestID
        });

        payment.metadata = {
          ...(payment.metadata || {}),
          mpesa_request: mpesaResult.request,
          mpesa_response: mpesaResult.response,
          MerchantRequestID: mpesaResult.response.MerchantRequestID,
          CheckoutRequestID: mpesaResult.response.CheckoutRequestID
        };
      }

      // Log activity
      await ActivityLog.logPayment(userId, payment.id, amount, req.ip);

      res.status(201).json({
        success: true,
        payment,
        payment_instructions: normalizedMethod === 'mpesa' ? {
          method: 'mpesa',
          checkout_request_id: mpesaResult?.response?.CheckoutRequestID,
          merchant_request_id: mpesaResult?.response?.MerchantRequestID,
          account_reference: transactionId,
          phone_number: normalizePhoneNumber(phone_number),
          amount,
          customer_message: mpesaResult?.response?.CustomerMessage || 'Check your phone and enter your M-Pesa PIN.'
        } : null,
        message: 'Payment initiated successfully'
      });
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(error.statusCode || 500).json({ error: error.message || 'Failed to create payment' });
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

  async getPaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const payment = await Payment.findById(id);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      if (payment.user_id !== req.user.id && req.user.user_type !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({
        success: true,
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          transaction_id: payment.transaction_id,
          payment_method: payment.payment_method,
          paid_at: payment.paid_at,
          metadata: payment.metadata
        }
      });
    } catch (error) {
      console.error('Get payment status error:', error);
      res.status(500).json({ error: 'Failed to retrieve payment status' });
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
      const updatedPayment = await completePayment({
        payment,
        status,
        paidAt: status === 'completed' ? new Date() : null,
        metadata: { amount, transaction_id, webhook_metadata: metadata },
        ipAddress: req.ip
      });

      res.json({
        success: true,
        payment: updatedPayment
      });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  async handleMpesaCallback(req, res) {
    try {
      const callback = req.body?.Body?.stkCallback;

      if (!callback) {
        return res.status(400).json({ ResultCode: 1, ResultDesc: 'Invalid callback payload' });
      }

      const merchantRequestId = callback.MerchantRequestID;
      const checkoutRequestId = callback.CheckoutRequestID;
      const resultCode = Number(callback.ResultCode);
      const callbackItems = extractCallbackItems(callback.CallbackMetadata);
      const payment = await Payment.findByMpesaRequest(merchantRequestId, checkoutRequestId);

      if (!payment) {
        await ActivityLog.create({
          action: 'mpesa_callback_unmatched',
          description: `Unmatched M-Pesa callback ${checkoutRequestId || merchantRequestId}`,
          ip_address: req.ip,
          metadata: { callback }
        });

        return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
      }

      const status = resultCode === 0 ? 'completed' : 'failed';
      const paidAt = resultCode === 0 ? new Date() : null;

      await completePayment({
        payment,
        status,
        paidAt,
        metadata: {
          mpesa_callback: callback,
          mpesa_receipt_number: callbackItems.MpesaReceiptNumber,
          mpesa_phone_number: callbackItems.PhoneNumber,
          mpesa_callback_amount: callbackItems.Amount,
          mpesa_result_code: resultCode,
          mpesa_result_desc: callback.ResultDesc
        },
        ipAddress: req.ip
      });

      if (resultCode !== 0) {
        await ActivityLog.create({
          user_id: payment.user_id,
          action: 'payment_failed',
          entity_type: 'payment',
          entity_id: payment.id,
          description: `M-Pesa payment failed: ${callback.ResultDesc}`,
          ip_address: req.ip,
          metadata: { resultCode, resultDesc: callback.ResultDesc }
        });
      }

      res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } catch (error) {
      console.error('M-Pesa callback error:', error);
      res.status(500).json({ ResultCode: 1, ResultDesc: 'Callback processing failed' });
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
