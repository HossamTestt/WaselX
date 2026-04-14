/**
 * Bids Controller
 * Handles carrier bid submission, acceptance, and rejection
 */
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const { sequelize } = require('../../config/database');
const { QueryTypes } = require('sequelize');
const { sendPushNotification } = require('../../services/notificationService');

/**
 * POST /api/bids
 * Carrier submits a bid on an open shipment
 */
exports.submitBid = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { shipment_id, price, estimated_hours, note } = req.body;

    // Verify shipment exists and is open/bidding
    const [shipment] = await sequelize.query(
      "SELECT id, status, shipper_id FROM shipments WHERE id = :id AND status IN ('open', 'bidding')",
      { replacements: { id: shipment_id }, type: QueryTypes.SELECT }
    );

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found or is no longer accepting bids',
      });
    }

    // Carrier can't bid on their own... (carriers don't own shipments, but sanity check)
    // Check for existing bid
    const [existingBid] = await sequelize.query(
      "SELECT id FROM bids WHERE shipment_id = :shipmentId AND carrier_id = :carrierId AND status = 'pending'",
      { replacements: { shipmentId: shipment_id, carrierId: req.user.id }, type: QueryTypes.SELECT }
    );

    if (existingBid) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a bid for this shipment. Withdraw it first to re-bid.',
      });
    }

    const bidId = uuidv4();
    await sequelize.query(
      `INSERT INTO bids (id, shipment_id, carrier_id, price, estimated_hours, note)
       VALUES (:id, :shipment_id, :carrier_id, :price, :estimated_hours, :note)`,
      {
        replacements: { id: bidId, shipment_id, carrier_id: req.user.id, price, estimated_hours, note },
        type: QueryTypes.INSERT,
      }
    );

    // Update shipment status to 'bidding' if still 'open'
    if (shipment.status === 'open') {
      await sequelize.query(
        "UPDATE shipments SET status = 'bidding' WHERE id = :id",
        { replacements: { id: shipment_id }, type: QueryTypes.UPDATE }
      );
    }

    const [bid] = await sequelize.query(
      'SELECT * FROM bids WHERE id = :id',
      { replacements: { id: bidId }, type: QueryTypes.SELECT }
    );

    res.status(201).json({
      success: true,
      message: 'Bid submitted successfully',
      data: bid,
    });

    // Notify Shipper
    sendPushNotification(
      shipment.shipper_id,
      'New Bid Received! 📦',
      `A carrier has submitted a bid of AED ${price} for your shipment from ${shipment.pickup_city || 'your location'}.`,
      { type: 'new_bid', shipmentId: shipment_id, bidId }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bids/shipment/:shipmentId
 * Shipper views all bids on their shipment
 */
exports.getBidsForShipment = async (req, res, next) => {
  try {
    const { shipmentId } = req.params;

    // Verify shipper owns this shipment (or is admin)
    if (req.user.role === 'shipper') {
      const [shipment] = await sequelize.query(
        'SELECT id FROM shipments WHERE id = :id AND shipper_id = :shipperId',
        { replacements: { id: shipmentId, shipperId: req.user.id }, type: QueryTypes.SELECT }
      );
      if (!shipment) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const bids = await sequelize.query(
      `SELECT b.*, 
              u.name as carrier_name, u.phone as carrier_phone, u.profile_photo_url,
              cp.vehicle_type, cp.vehicle_capacity, cp.rating, cp.total_trips, cp.is_verified, cp.company_name
       FROM bids b
       JOIN users u ON u.id = b.carrier_id
       LEFT JOIN carrier_profiles cp ON cp.user_id = b.carrier_id
       WHERE b.shipment_id = :shipmentId
       ORDER BY b.price ASC, b.created_at ASC`,
      { replacements: { shipmentId }, type: QueryTypes.SELECT }
    );

    res.json({ success: true, data: bids });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bids/my
 * Carrier views all their submitted bids
 */
exports.getMyBids = async (req, res, next) => {
  try {
    const bids = await sequelize.query(
      `SELECT b.*,
              s.pickup_address, s.dropoff_address, s.load_type, s.status as shipment_status,
              s.pickup_city, s.dropoff_city, s.weight_tonnes
       FROM bids b
       JOIN shipments s ON s.id = b.shipment_id
       WHERE b.carrier_id = :carrierId
       ORDER BY b.created_at DESC`,
      { replacements: { carrierId: req.user.id }, type: QueryTypes.SELECT }
    );

    res.json({ success: true, data: bids });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/bids/:id/accept
 * Shipper accepts a bid — assigns shipment to carrier
 */
exports.acceptBid = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch bid with shipment
    const [bid] = await sequelize.query(
      `SELECT b.*, s.shipper_id, s.status as shipment_status
       FROM bids b JOIN shipments s ON s.id = b.shipment_id
       WHERE b.id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    if (!bid) {
      return res.status(404).json({ success: false, message: 'Bid not found' });
    }

    if (bid.shipper_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not your shipment' });
    }

    if (!['open', 'bidding'].includes(bid.shipment_status)) {
      return res.status(400).json({ success: false, message: 'Shipment is no longer available' });
    }

    // Get commission rate from platform settings
    const [settings] = await sequelize.query(
      "SELECT value FROM platform_settings WHERE key = 'commission_rate'",
      { type: QueryTypes.SELECT }
    );
    const commissionRate = parseFloat(settings?.value || 10);
    const commissionAmount = (bid.price * commissionRate) / 100;

    // Accept this bid, reject all others, assign shipment
    await sequelize.query(
      "UPDATE bids SET status = 'accepted' WHERE id = :id",
      { replacements: { id }, type: QueryTypes.UPDATE }
    );

    await sequelize.query(
      "UPDATE bids SET status = 'rejected' WHERE shipment_id = :shipmentId AND id != :id AND status = 'pending'",
      { replacements: { shipmentId: bid.shipment_id, id }, type: QueryTypes.UPDATE }
    );

    await sequelize.query(
      `UPDATE shipments SET 
         status = 'assigned', 
         assigned_carrier_id = :carrierId,
         final_price = :price,
         commission_rate = :commissionRate,
         commission_amount = :commissionAmount,
         assigned_at = NOW()
       WHERE id = :shipmentId`,
      {
        replacements: {
          carrierId: bid.carrier_id,
          price: bid.price,
          commissionRate,
          commissionAmount,
          shipmentId: bid.shipment_id,
        },
        type: QueryTypes.UPDATE,
      }
    );

    res.json({
      success: true,
      message: 'Bid accepted. Carrier has been assigned.',
      data: { bidId: id, carrierId: bid.carrier_id, finalPrice: bid.price, commissionAmount },
    });

    // Notify Carrier
    sendPushNotification(
      bid.carrier_id,
      'Bid Accepted! 🎉',
      `Your bid of AED ${bid.price} has been accepted. View details to start the job.`,
      { type: 'bid_accepted', shipmentId: bid.shipment_id, bidId: id }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/bids/:id/reject
 * Shipper rejects a specific bid
 */
exports.rejectBid = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [bid] = await sequelize.query(
      `SELECT b.*, s.shipper_id FROM bids b JOIN shipments s ON s.id = b.shipment_id WHERE b.id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    if (!bid || bid.shipper_id !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Bid not found or access denied' });
    }

    await sequelize.query(
      "UPDATE bids SET status = 'rejected' WHERE id = :id",
      { replacements: { id }, type: QueryTypes.UPDATE }
    );

    res.json({ success: true, message: 'Bid rejected' });

    // Notify Carrier
    sendPushNotification(
      bid.carrier_id,
      'Bid Update 📋',
      'The shipper has rejected your bid for the shipment.',
      { type: 'bid_rejected', shipmentId: bid.shipment_id, bidId: id }
    );
  } catch (error) {
    next(error);
  }
};
