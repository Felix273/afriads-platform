// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Create a new payment
router.post('/', paymentController.createPayment);

// Get user's payment history
router.get('/', paymentController.getPayments);

// Get specific payment by ID
router.get('/:id', paymentController.getPaymentById);

// Get payment statistics
router.get('/stats/summary', paymentController.getPaymentStats);

// Webhook for payment gateway (Stripe/PayPal)
router.post('/webhook', paymentController.handleWebhook);

// Admin: Get all payments (admin only)
router.get('/admin/all', paymentController.getAllPayments);

module.exports = router;
