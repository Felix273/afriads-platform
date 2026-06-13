// src/routes/adServeRoutes.js
const express = require('express');
const router = express.Router();
const adServeController = require('../controllers/adServeController');

// Fraud detection middleware
router.use(adServeController.checkBlockedIP);

// Public routes (no authentication needed)
router.get('/serve', adServeController.serveAd);
router.get('/click/:impression_id', adServeController.trackClick);
router.post('/conversion', adServeController.trackConversion);

// Stats route
router.get('/stats', adServeController.getAdStats);

module.exports = router;
