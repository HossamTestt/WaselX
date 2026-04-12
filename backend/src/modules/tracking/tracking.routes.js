const express = require('express');
const router = express.Router();
const trackingController = require('./tracking.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

// Carrier pushes GPS location
router.post('/update', authorize('carrier'), trackingController.pushLocation);

// Shipper/admin/carrier views tracking log
router.get('/shipment/:id', trackingController.getTrackingLog);

module.exports = router;
