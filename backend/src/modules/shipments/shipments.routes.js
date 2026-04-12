/**
 * Shipments Routes
 * /api/shipments/*
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const shipmentsController = require('./shipments.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// All shipment routes require authentication
router.use(authenticate);

const createShipmentRules = [
  body('pickup_address').notEmpty().withMessage('Pickup address is required'),
  body('dropoff_address').notEmpty().withMessage('Drop-off address is required'),
  body('load_type').notEmpty().withMessage('Load type is required'),
  body('pickup_lat').optional().isFloat({ min: -90, max: 90 }),
  body('pickup_lng').optional().isFloat({ min: -180, max: 180 }),
  body('dropoff_lat').optional().isFloat({ min: -90, max: 90 }),
  body('dropoff_lng').optional().isFloat({ min: -180, max: 180 }),
  body('weight_tonnes').optional().isFloat({ min: 0 }),
  body('budget_min').optional().isFloat({ min: 0 }),
  body('budget_max').optional().isFloat({ min: 0 }),
];

router.post('/', authorize('shipper'), createShipmentRules, shipmentsController.createShipment);
router.get('/', shipmentsController.listShipments);
router.get('/:id', shipmentsController.getShipment);
router.patch('/:id/status', authorize('carrier'), shipmentsController.updateStatus);
router.delete('/:id', authorize('shipper'), shipmentsController.cancelShipment);

module.exports = router;
