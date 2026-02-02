// src/routes/publisherRoutes.js
const express = require('express');
const router = express.Router();
const publisherController = require('../controllers/publisherController');
const { authenticate, isPublisher } = require('../middleware/auth');

// All routes require authentication and publisher role
router.use(authenticate, isPublisher);

// Website management
router.post('/websites', publisherController.submitWebsite);
router.get('/websites', publisherController.getWebsites);
router.get('/websites/:id', publisherController.getWebsite);

// Ad zones
router.post('/websites/:website_id/zones', publisherController.createAdZone);
router.get('/websites/:website_id/zones', publisherController.getAdZones);
router.get('/zones/:zone_id/tag', publisherController.getAdTag);

// Earnings
router.get('/earnings', publisherController.getEarnings);

module.exports = router;
