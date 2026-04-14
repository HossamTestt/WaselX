/**
 * Shipments Controller
 * CRUD + status management for freight shipments
 */
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const { sequelize } = require('../../config/database');
const { QueryTypes } = require('sequelize');
const { sendPushNotification } = require('../../services/notificationService');

/**
 * POST /api/shipments
 * Shipper creates a new shipment request
 */
exports.createShipment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      pickup_address, pickup_city, pickup_lat, pickup_lng,
      dropoff_address, dropoff_city, dropoff_lat, dropoff_lng,
      load_type, description, weight_tonnes, dimensions_cbm,
      pickup_date, pickup_time_window, budget_min, budget_max,
    } = req.body;

    const id = uuidv4();
    await sequelize.query(
      `INSERT INTO shipments (
        id, shipper_id, pickup_address, pickup_city, pickup_lat, pickup_lng,
        dropoff_address, dropoff_city, dropoff_lat, dropoff_lng,
        load_type, description, weight_tonnes, dimensions_cbm,
        pickup_date, pickup_time_window, budget_min, budget_max, status
      ) VALUES (
        :id, :shipper_id, :pickup_address, :pickup_city, :pickup_lat, :pickup_lng,
        :dropoff_address, :dropoff_city, :dropoff_lat, :dropoff_lng,
        :load_type, :description, :weight_tonnes, :dimensions_cbm,
        :pickup_date, :pickup_time_window, :budget_min, :budget_max, 'open'
      )`,
      {
        replacements: {
          id, shipper_id: req.user.id,
          pickup_address, pickup_city, pickup_lat, pickup_lng,
          dropoff_address, dropoff_city, dropoff_lat, dropoff_lng,
          load_type, description, weight_tonnes, dimensions_cbm,
          pickup_date, pickup_time_window, budget_min, budget_max,
        },
        type: QueryTypes.INSERT,
      }
    );

    const [shipment] = await sequelize.query(
      'SELECT * FROM shipments WHERE id = :id',
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/shipments
 * List shipments filtered by user role:
 * - Shipper: sees their own shipments
 * - Carrier: sees all open/bidding shipments they can bid on
 * - Admin: sees all shipments
 */
exports.listShipments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, city } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const replacements = { limit: parseInt(limit), offset: parseInt(offset) };

    if (req.user.role === 'shipper') {
      whereClause = 'WHERE s.shipper_id = :userId';
      replacements.userId = req.user.id;
    } else if (req.user.role === 'carrier') {
      // Carriers see open shipments + their assigned shipments
      whereClause = "WHERE (s.status IN ('open', 'bidding') OR s.assigned_carrier_id = :userId)";
      replacements.userId = req.user.id;
    }
    // Admin sees all (no where clause)

    if (status) {
      whereClause += whereClause ? ' AND s.status = :status' : 'WHERE s.status = :status';
      replacements.status = status;
    }

    if (city) {
      whereClause += (whereClause ? ' AND' : 'WHERE') + ' s.pickup_city ILIKE :city';
      replacements.city = `%${city}%`;
    }

    const shipments = await sequelize.query(
      `SELECT s.*,
              u.name as shipper_name, u.phone as shipper_phone,
              (SELECT COUNT(*) FROM bids b WHERE b.shipment_id = s.id) as bid_count
       FROM shipments s
       JOIN users u ON u.id = s.shipper_id
       ${whereClause}
       ORDER BY s.created_at DESC
       LIMIT :limit OFFSET :offset`,
      { replacements, type: QueryTypes.SELECT }
    );

    const [{ total }] = await sequelize.query(
      `SELECT COUNT(*) as total FROM shipments s ${whereClause}`,
      { replacements, type: QueryTypes.SELECT }
    );

    res.json({
      success: true,
      data: shipments,
      pagination: {
        total: parseInt(total),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/shipments/:id
 * Get single shipment with bids and latest tracking
 */
exports.getShipment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [shipment] = await sequelize.query(
      `SELECT s.*,
              u.name as shipper_name, u.phone as shipper_phone,
              cu.name as carrier_name, cu.phone as carrier_phone
       FROM shipments s
       JOIN users u ON u.id = s.shipper_id
       LEFT JOIN users cu ON cu.id = s.assigned_carrier_id
       WHERE s.id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    // Shipper can only view their own shipments; carriers can view open ones or their assigned
    if (req.user.role === 'shipper' && shipment.shipper_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get bids for this shipment
    const bids = await sequelize.query(
      `SELECT b.*, u.name as carrier_name, cp.vehicle_type, cp.rating, cp.total_trips, cp.is_verified
       FROM bids b
       JOIN users u ON u.id = b.carrier_id
       LEFT JOIN carrier_profiles cp ON cp.user_id = b.carrier_id
       WHERE b.shipment_id = :id
       ORDER BY b.price ASC`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    // Get latest tracking location
    const [latestTracking] = await sequelize.query(
      `SELECT * FROM tracking_logs WHERE shipment_id = :id ORDER BY timestamp DESC LIMIT 1`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    res.json({
      success: true,
      data: { ...shipment, bids, latestTracking: latestTracking || null },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/shipments/:id/status
 * Carrier updates shipment status (picked_up → in_transit → delivered)
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validTransitions = {
      assigned: ['picked_up'],
      picked_up: ['in_transit'],
      in_transit: ['delivered'],
    };

    const [shipment] = await sequelize.query(
      'SELECT * FROM shipments WHERE id = :id',
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    if (shipment.assigned_carrier_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not your assigned shipment' });
    }

    const allowed = validTransitions[shipment.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${shipment.status}' to '${status}'`,
      });
    }

    const deliveredAt = status === 'delivered' ? 'NOW()' : 'NULL';
    await sequelize.query(
      `UPDATE shipments SET status = :status, delivered_at = ${status === 'delivered' ? 'NOW()' : 'delivered_at'}
       WHERE id = :id`,
      { replacements: { status, id }, type: QueryTypes.UPDATE }
    );

    // Log status change in tracking
    await sequelize.query(
      `INSERT INTO tracking_logs (id, shipment_id, carrier_id, event_type, status, notes)
       VALUES (:logId, :shipmentId, :carrierId, 'status_change', :status, :notes)`,
      {
        replacements: { logId: uuidv4(), shipmentId: id, carrierId: req.user.id, status, notes },
        type: QueryTypes.INSERT,
      }
    );

    res.json({ success: true, message: `Shipment status updated to '${status}'` });

    // Notify Shipper
    const statusMessages = {
      picked_up: 'Pack your bags! Your shipment has been picked up. 🚛',
      in_transit: 'On the way! Your shipment is now in transit. 🛣️',
      delivered: 'Arrived! Your shipment has been successfully delivered. ✅',
    };

    if (statusMessages[status]) {
      sendPushNotification(
        shipment.shipper_id,
        'Shipment Update 📦',
        statusMessages[status],
        { type: 'status_update', shipmentId: id, status }
      );
    }
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/shipments/:id
 * Shipper cancels a shipment (only if open/bidding)
 */
exports.cancelShipment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [shipment] = await sequelize.query(
      'SELECT * FROM shipments WHERE id = :id AND shipper_id = :shipperId',
      { replacements: { id, shipperId: req.user.id }, type: QueryTypes.SELECT }
    );

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    if (!['open', 'bidding'].includes(shipment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a shipment that has already been assigned',
      });
    }

    await sequelize.query(
      "UPDATE shipments SET status = 'cancelled' WHERE id = :id",
      { replacements: { id }, type: QueryTypes.UPDATE }
    );

    res.json({ success: true, message: 'Shipment cancelled' });
  } catch (error) {
    next(error);
  }
};
