// src/routes/campaignRoutes.js
const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { authenticate, isAdvertiser } = require('../middleware/auth');
const adCreativeController = require('../controllers/adCreativeController');
const upload = require('../middleware/upload');

// Image upload route
router.post('/creatives/upload', upload.single('image'), adCreativeController.uploadImage);

// All routes require authentication and advertiser role
router.use(authenticate, isAdvertiser);

// Campaign CRUD
router.post('/', campaignController.createCampaign);
router.get('/', campaignController.getCampaigns);
router.get('/:id', campaignController.getCampaign);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);

// Campaign statistics
router.get('/:id/stats', campaignController.getCampaignStats);

// Ad Creative routes
router.post('/:campaign_id/creatives', adCreativeController.createCreative);
router.get('/:campaign_id/creatives', adCreativeController.getCreatives);
router.get('/:campaign_id/creatives/:creative_id', adCreativeController.getCreative);
router.put('/:campaign_id/creatives/:creative_id', adCreativeController.updateCreative);
router.delete('/:campaign_id/creatives/:creative_id', adCreativeController.deleteCreative);

module.exports = router;
