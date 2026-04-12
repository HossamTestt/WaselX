/**
 * Tracking Controller
 * GPS location updates + status event logs for shipments
 */
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../../config/database');
const { QueryTypes } = require('sequelize');

/**
 * POST /api/tracking/update
 * Carrier pushes their GPS location (called periodically from mobile app)
 */
exports.pushLocation = async (req, res, next) => {
  try {
    const { shipment_id, lat, lng, accuracy } = req.body;

    if (!shipment_id || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'shipment_id, lat, and lng are required' });
    }

    // Verify carrier is assigned to this shipment
    const [shipment] = await sequelize.query(
      `SELECT id, status FROM shipments 
       WHERE id = :id AND assigned_carrier_id = :carrierId
         AND status IN ('assigned', 'picked_up', 'in_transit')`,
      { replacements: { id: shipment_id, carrierId: req.user.id }, type: QueryTypes.SELECT }
    );

    if (!shipment) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this shipment or tracking is not active',
      });
    }

    // Insert tracking log
    await sequelize.query(
      `INSERT INTO tracking_logs (id, shipment_id, carrier_id, lat, lng, accuracy, event_type, status)
       VALUES (:id, :shipmentId, :carrierId, :lat, :lng, :accuracy, 'location_update', :status)`,
      {
        replacements: {
          id: uuidv4(),
          shipmentId: shipment_id,
          carrierId: req.user.id,
          lat, lng, accuracy: accuracy || null,
          status: shipment.status,
        },
        type: QueryTypes.INSERT,
      }
    );

    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tracking/shipment/:id
 * Get full tracking log for a shipment (most recent first)
 */
exports.getTrackingLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    // Verify access: shipper owns shipment or carrier is assigned
    const [shipment] = await sequelize.query(
      'SELECT id, shipper_id, assigned_carrier_id FROM shipments WHERE id = :id',
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    if (!shipment) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    if (
      req.user.role === 'shipper' && shipment.shipper_id !== req.user.id ||
      req.user.role === 'carrier' && shipment.assigned_carrier_id !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const logs = await sequelize.query(
      `SELECT id, lat, lng, accuracy, event_type, status, notes, timestamp
       FROM tracking_logs
       WHERE shipment_id = :id
       ORDER BY timestamp DESC
       LIMIT :limit`,
      { replacements: { id, limit: parseInt(limit) }, type: QueryTypes.SELECT }
    );

    // Get current carrier location (most recent)
    const [latest] = logs.filter((l) => l.event_type === 'location_update');

    res.json({
      success: true,
      data: {
        logs,
        currentLocation: latest ? { lat: latest.lat, lng: latest.lng, timestamp: latest.timestamp } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};
