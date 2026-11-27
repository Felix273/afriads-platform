// src/routes/adServeRoutes.js
const express = require('express');
const router = express.Router();
const adServeController = require('../controllers/adServeController');
const { authenticate } = require('../middleware/auth');

// Fraud detection middleware
router.use(adServeController.checkBlockedIP);

// Public routes (no authentication needed)
router.get('/serve', adServeController.serveAd);
router.get('/click/:impression_id', adServeController.trackClick);
router.post('/conversion', adServeController.trackConversion);

// Protected stats route (scoped to owner/admin)
router.get('/stats', authenticate, adServeController.getAdStats);

module.exports = router;
