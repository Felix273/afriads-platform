// controllers/payoutController.js
const Payout = require('../models/Payout');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const pool = require('../config/database');

class PayoutController {
  // Request a payout
  async requestPayout(req, res) {
    try {
      const { amount, payout_method, account_details, description } = req.body;
      const userId = req.user.id;

      // Validation
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      // Check minimum payout
      const minimumPayout = await Payout.getMinimumPayoutAmount();
      if (amount < minimumPayout) {
        return res.status(400).json({ 
          error: `Minimum payout amount is $${minimumPayout}` 
        });
      }

      // Check user balance
      const userResult = await pool.query(
        'SELECT balance, user_type FROM users WHERE id = $1',
        [userId]
      );
      const user = userResult.rows[0];

      if (user.user_type !== 'publisher') {
        return res.status(403).json({ error: 'Only publishers can request payouts' });
      }

      if (user.balance < amount) {
        return res.status(400).json({ 
          error: 'Insufficient balance',
          available: user.balance,
          requested: amount
        });
      }

      // Create payout request
      const payout = await Payout.create({
        publisher_id: userId,
        amount,
        payout_method: payout_method || 'paypal',
        account_details,
        description
      });

      // Log activity
      await ActivityLog.logPayoutRequest(userId, payout.id, amount, req.ip);

      // Notify user
      await Notification.create({
        user_id: userId,
        type: 'payout_requested',
        title: 'Payout Request Submitted',
        message: `Your payout request of $${amount} has been submitted and is pending approval.`,
        data: { payout_id: payout.id, amount }
      });

      res.status(201).json({
        success: true,
        payout,
        message: 'Payout request submitted successfully'
      });
    } catch (error) {
      console.error('Request payout error:', error);
      res.status(500).json({ error: 'Failed to request payout' });
    }
  }

  // Get user's payouts
  async getPayouts(req, res) {
    try {
      const userId = req.user.id;
      const payouts = await Payout.findByPublisherId(userId);

      res.json({
        success: true,
        payouts,
        count: payouts.length
      });
    } catch (error) {
      console.error('Get payouts error:', error);
      res.status(500).json({ error: 'Failed to retrieve payouts' });
    }
  }

  // Get payout by ID
  async getPayoutById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const payout = await Payout.findById(id);

      if (!payout) {
        return res.status(404).json({ error: 'Payout not found' });
      }

      // Check ownership (or admin)
      if (payout.publisher_id !== userId && req.user.user_type !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({
        success: true,
        payout
      });
    } catch (error) {
      console.error('Get payout error:', error);
      res.status(500).json({ error: 'Failed to retrieve payout' });
    }
  }

  // Get payout statistics
  async getPayoutStats(req, res) {
    try {
      const userId = req.user.id;
      const { start_date, end_date } = req.query;

      const stats = await Payout.getStats(userId, start_date, end_date);

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Get payout stats error:', error);
      res.status(500).json({ error: 'Failed to retrieve payout statistics' });
    }
  }

  // Get minimum payout amount
  async getMinimumPayout(req, res) {
    try {
      const minimum = await Payout.getMinimumPayoutAmount();
      
      res.json({
        success: true,
        minimum_payout: minimum
      });
    } catch (error) {
      console.error('Get minimum payout error:', error);
      res.status(500).json({ error: 'Failed to retrieve minimum payout' });
    }
  }

  // Cancel pending payout
  async cancelPayout(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const payout = await Payout.findById(id);

      if (!payout) {
        return res.status(404).json({ error: 'Payout not found' });
      }

      // Check ownership
      if (payout.publisher_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Can only cancel pending payouts
      if (payout.status !== 'pending') {
        return res.status(400).json({ 
          error: `Cannot cancel payout with status: ${payout.status}` 
        });
      }

      // Update status
      const updatedPayout = await Payout.updateStatus(id, 'cancelled');

      // Log activity
      await ActivityLog.create({
        user_id: userId,
        action: 'cancel_payout',
        entity_type: 'payout',
        entity_id: id,
        description: `Cancelled payout request: $${payout.amount}`,
        ip_address: req.ip
      });

      res.json({
        success: true,
        payout: updatedPayout,
        message: 'Payout cancelled successfully'
      });
    } catch (error) {
      console.error('Cancel payout error:', error);
      res.status(500).json({ error: 'Failed to cancel payout' });
    }
  }

  // Admin: Get pending payouts
  async getPendingPayouts(req, res) {
    try {
      // Check admin permission
      if (req.user.user_type !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const payouts = await Payout.getPendingPayouts();

      res.json({
        success: true,
        payouts,
        count: payouts.length
      });
    } catch (error) {
      console.error('Get pending payouts error:', error);
      res.status(500).json({ error: 'Failed to retrieve pending payouts' });
    }
  }

  // Admin: Approve payout
  async approvePayout(req, res) {
    try {
      // Check admin permission
      if (req.user.user_type !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const { transaction_id } = req.body;

      const payout = await Payout.findById(id);

      if (!payout) {
        return res.status(404).json({ error: 'Payout not found' });
      }

      if (payout.status !== 'pending') {
        return res.status(400).json({ 
          error: `Payout is already ${payout.status}` 
        });
      }

      // Update to processing
      await Payout.updateStatus(id, 'processing');

      // Deduct from publisher balance
      await pool.query(
        'UPDATE users SET balance = balance - $1 WHERE id = $2',
        [payout.amount, payout.publisher_id]
      );

      // Mark as completed
      const updatedPayout = await Payout.updateStatus(id, 'completed', transaction_id);

      // Notify publisher
      await Notification.notifyPayoutProcessed(payout.publisher_id, payout.amount);

      // Log activity
      await ActivityLog.create({
        user_id: req.user.id,
        action: 'approve_payout',
        entity_type: 'payout',
        entity_id: id,
        description: `Approved payout: $${payout.amount} for publisher ${payout.publisher_id}`,
        ip_address: req.ip,
        metadata: { transaction_id }
      });

      res.json({
        success: true,
        payout: updatedPayout,
        message: 'Payout approved and processed successfully'
      });
    } catch (error) {
      console.error('Approve payout error:', error);
      res.status(500).json({ error: 'Failed to approve payout' });
    }
  }

  // Admin: Reject payout
  async rejectPayout(req, res) {
    try {
      // Check admin permission
      if (req.user.user_type !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const { reason } = req.body;

      const payout = await Payout.findById(id);

      if (!payout) {
        return res.status(404).json({ error: 'Payout not found' });
      }

      if (payout.status !== 'pending') {
        return res.status(400).json({ 
          error: `Payout is already ${payout.status}` 
        });
      }

      // Update status
      const updatedPayout = await Payout.updateStatus(id, 'failed');

      // Notify publisher
      await Notification.create({
        user_id: payout.publisher_id,
        type: 'payout_rejected',
        title: 'Payout Request Rejected',
        message: `Your payout request of $${payout.amount} has been rejected. ${reason || ''}`,
        data: { payout_id: id, amount: payout.amount, reason }
      });

      // Log activity
      await ActivityLog.create({
        user_id: req.user.id,
        action: 'reject_payout',
        entity_type: 'payout',
        entity_id: id,
        description: `Rejected payout: $${payout.amount} for publisher ${payout.publisher_id}`,
        ip_address: req.ip,
        metadata: { reason }
      });

      res.json({
        success: true,
        payout: updatedPayout,
        message: 'Payout rejected successfully'
      });
    } catch (error) {
      console.error('Reject payout error:', error);
      res.status(500).json({ error: 'Failed to reject payout' });
    }
  }
}

module.exports = new PayoutController();
