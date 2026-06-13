const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.use(authenticate, isAdmin);

router.get('/overview', adminController.getOverview);

router.get('/websites/pending', adminController.getPendingWebsites);
router.put('/websites/:id/moderate', adminController.moderateWebsite);

router.get('/creatives/pending', adminController.getPendingCreatives);
router.put('/creatives/:id/moderate', adminController.moderateCreative);

router.get('/blocked-ips', adminController.getBlockedIPs);
router.post('/blocked-ips', adminController.blockIP);
router.delete('/blocked-ips/:id', adminController.unblockIP);

module.exports = router;
