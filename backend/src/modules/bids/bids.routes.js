/**
 * Bids Routes — /api/bids/*
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const bidsController = require('./bids.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

const submitBidRules = [
  body('shipment_id').isUUID().withMessage('Valid shipment ID required'),
  body('price').isFloat({ min: 50 }).withMessage('Price must be at least 50 AED'),
  body('estimated_hours').optional().isFloat({ min: 0.5 }),
  body('note').optional().isLength({ max: 500 }),
];

// Carrier submits a bid
router.post('/', authorize('carrier'), submitBidRules, bidsController.submitBid);

// Carrier views their own bids
router.get('/my', authorize('carrier'), bidsController.getMyBids);

// Shipper/admin views all bids for a shipment
router.get('/shipment/:shipmentId', authorize('shipper', 'admin'), bidsController.getBidsForShipment);

// Shipper accepts/rejects bids
router.patch('/:id/accept', authorize('shipper'), bidsController.acceptBid);
router.patch('/:id/reject', authorize('shipper'), bidsController.rejectBid);

module.exports = router;
