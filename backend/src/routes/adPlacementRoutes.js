// routes/adPlacementRoutes.js
const express = require('express');
const router = express.Router();
const adPlacementController = require('../controllers/adPlacementController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Create ad placement
router.post('/', adPlacementController.createPlacement);

// Get placements for a website
router.get('/website/:websiteId', adPlacementController.getWebsitePlacements);

// Get active placements for a website
router.get('/website/:websiteId/active', adPlacementController.getActivePlacements);

// Get specific placement
router.get('/:id', adPlacementController.getPlacementById);

// Update placement
router.put('/:id', adPlacementController.updatePlacement);

// Delete placement
router.delete('/:id', adPlacementController.deletePlacement);

module.exports = router;
