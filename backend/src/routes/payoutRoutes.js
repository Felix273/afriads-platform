// routes/payoutRoutes.js
const express = require('express');
const router = express.Router();
const payoutController = require('../controllers/payoutController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Request a payout
router.post('/', payoutController.requestPayout);

// Get user's payout history
router.get('/', payoutController.getPayouts);

// Get specific payout by ID
router.get('/:id', payoutController.getPayoutById);

// Get payout statistics
router.get('/stats/summary', payoutController.getPayoutStats);

// Get minimum payout amount
router.get('/info/minimum', payoutController.getMinimumPayout);

// Cancel pending payout
router.delete('/:id', payoutController.cancelPayout);

// Admin routes
router.get('/admin/pending', payoutController.getPendingPayouts);
router.put('/admin/:id/approve', payoutController.approvePayout);
router.put('/admin/:id/reject', payoutController.rejectPayout);

module.exports = router;
