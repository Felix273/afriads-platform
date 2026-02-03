// routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get user's activity logs
router.get('/', activityController.getUserActivity);

// Get activity for specific entity
router.get('/entity/:type/:id', activityController.getEntityActivity);

// Admin: Get recent activity
router.get('/admin/recent', activityController.getRecentActivity);

// Admin: Get activity by action type
router.get('/admin/action/:action', activityController.getActivityByAction);

module.exports = router;
