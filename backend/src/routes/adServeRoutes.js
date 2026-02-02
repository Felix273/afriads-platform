// src/routes/adServeRoutes.js
const express = require('express');
const router = express.Router();
const adServeController = require('../controllers/adServeController');

// Public routes (no authentication needed)
router.get('/serve', adServeController.serveAd);
router.get('/click/:impression_id', adServeController.trackClick);

// Stats route (can be public or protected based on your needs)
router.get('/stats', adServeController.getAdStats);

module.exports = router;
