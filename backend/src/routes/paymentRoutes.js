// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

// Public callback for Safaricom Daraja. Safaricom will not send a JWT.
router.post('/mpesa/callback', paymentController.handleMpesaCallback);

// All routes require authentication
router.use(authenticate);

// Create a new payment
router.post('/', paymentController.createPayment);

// Get user's payment history
router.get('/', paymentController.getPayments);

// Get payment statistics
router.get('/stats/summary', paymentController.getPaymentStats);

// Check M-Pesa sandbox/live configuration without exposing secrets
router.get('/mpesa/status', paymentController.getMpesaStatus);

// Get payment status
router.get('/:id/status', paymentController.getPaymentStatus);

// Webhook for payment gateway (Stripe/PayPal)
router.post('/webhook', paymentController.handleWebhook);

// Admin: Get all payments (admin only)
router.get('/admin/all', paymentController.getAllPayments);

// Get specific payment by ID
router.get('/:id', paymentController.getPaymentById);

module.exports = router;
