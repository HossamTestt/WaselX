/**
 * Admin Routes — Analytics + Platform Settings
 */
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { sequelize } = require('../../config/database');
const { QueryTypes } = require('sequelize');

router.use(authenticate, authorize('admin'));

// GET /api/admin/analytics — Platform-wide KPIs
router.get('/analytics', async (req, res, next) => {
  try {
    const [stats] = await sequelize.query(
      `SELECT 
         (SELECT COUNT(*) FROM users WHERE role = 'shipper') as total_shippers,
         (SELECT COUNT(*) FROM users WHERE role = 'carrier') as total_carriers,
         (SELECT COUNT(*) FROM users WHERE role = 'carrier' AND status = 'pending') as pending_carriers,
         (SELECT COUNT(*) FROM shipments) as total_shipments,
         (SELECT COUNT(*) FROM shipments WHERE status = 'open' OR status = 'bidding') as active_shipments,
         (SELECT COUNT(*) FROM shipments WHERE status = 'delivered') as delivered_shipments,
         (SELECT COALESCE(SUM(commission_amount), 0) FROM shipments WHERE status = 'delivered') as total_revenue,
         (SELECT COUNT(*) FROM bids) as total_bids`,
      { type: QueryTypes.SELECT }
    );

    // Shipments by status breakdown
    const statusBreakdown = await sequelize.query(
      `SELECT status, COUNT(*) as count FROM shipments GROUP BY status ORDER BY count DESC`,
      { type: QueryTypes.SELECT }
    );

    // Last 7 days shipments trend
    const trend = await sequelize.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM shipments
       WHERE created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at) ORDER BY date`,
      { type: QueryTypes.SELECT }
    );

    res.json({
      success: true,
      data: { kpis: stats, statusBreakdown, shipmentTrend: trend },
    });
  } catch (e) { next(e); }
});

// GET /api/admin/commission — Get commission settings
router.get('/commission', async (req, res, next) => {
  try {
    const settings = await sequelize.query(
      "SELECT * FROM platform_settings WHERE key = 'commission_rate'",
      { type: QueryTypes.SELECT }
    );
    res.json({ success: true, data: settings[0] });
  } catch (e) { next(e); }
});

// PATCH /api/admin/commission — Update commission rate
router.patch('/commission', async (req, res, next) => {
  try {
    const { rate } = req.body;
    if (typeof rate !== 'number' || rate < 0 || rate > 50) {
      return res.status(400).json({ success: false, message: 'Rate must be between 0 and 50' });
    }
    await sequelize.query(
      "UPDATE platform_settings SET value = :rate, updated_at = NOW() WHERE key = 'commission_rate'",
      { replacements: { rate: String(rate) }, type: QueryTypes.UPDATE }
    );
    res.json({ success: true, message: `Commission rate updated to ${rate}%` });
  } catch (e) { next(e); }
});

// GET /api/admin/marketplace — Live view of open shipments + available carriers
router.get('/marketplace', async (req, res, next) => {
  try {
    const openShipments = await sequelize.query(
      `SELECT s.*, u.name as shipper_name 
       FROM shipments s JOIN users u ON s.shipper_id = u.id 
       WHERE s.status IN ('open', 'bidding') 
       ORDER BY s.created_at DESC`,
      { type: QueryTypes.SELECT }
    );

    const availableCarriers = await sequelize.query(
      `SELECT u.id, u.name, u.email, u.phone, cp.vehicle_type, cp.rating
       FROM users u JOIN carrier_profiles cp ON u.id = cp.user_id
       WHERE u.role = 'carrier' AND u.status = 'active'
       -- AND NOT EXISTS (SELECT 1 FROM shipments s WHERE s.assigned_carrier_id = u.id AND s.status != 'delivered')
       ORDER BY cp.rating DESC`,
      { type: QueryTypes.SELECT }
    );

    res.json({ success: true, data: { openShipments, availableCarriers } });
  } catch (e) { next(e); }
});

// POST /api/admin/manual-assign — Admin forces a carrier onto a shipment
router.post('/manual-assign', async (req, res, next) => {
  try {
    const { shipmentId, carrierId, price } = req.body;
    if (!shipmentId || !carrierId || !price) {
      return res.status(400).json({ success: false, message: 'Shipment, Carrier and Price required' });
    }

    await sequelize.query(
      `UPDATE shipments SET 
        assigned_carrier_id = :carrierId, 
        status = 'assigned', 
        final_price = :price,
        assigned_at = NOW()
       WHERE id = :shipmentId`,
      { replacements: { carrierId, price, shipmentId }, type: QueryTypes.UPDATE }
    );

    // Also update any existing bids for this shipment to 'rejected' if we manually assign
    await sequelize.query(
      "UPDATE bids SET status = 'rejected' WHERE shipment_id = :shipmentId AND status = 'pending'",
      { replacements: { shipmentId }, type: QueryTypes.UPDATE }
    );

    res.json({ success: true, message: 'Carrier assigned manually' });
  } catch (e) { next(e); }
});

// GET /api/admin/activity — Live activity monitoring feed
router.get('/activity', async (req, res, next) => {
  try {
    // Fetch last 20 events from combined logs or derived from tables
    const activity = await sequelize.query(
      `(SELECT 'new_shipment' as type, description as title, name as user_name, s.created_at as timestamp 
        FROM shipments s JOIN users u ON s.shipper_id = u.id)
       UNION ALL
       (SELECT 'new_bid' as type, 'Bid for AED ' || price as title, name as user_name, b.created_at as timestamp 
        FROM bids b JOIN users u ON b.carrier_id = u.id)
       UNION ALL
       (SELECT 'new_user' as type, 'Joined as ' || role as title, name as user_name, created_at as timestamp 
        FROM users WHERE role != 'admin')
       ORDER BY timestamp DESC LIMIT 20`,
      { type: QueryTypes.SELECT }
    );

    res.json({ success: true, data: activity });
  } catch (e) { next(e); }
});

module.exports = router;
