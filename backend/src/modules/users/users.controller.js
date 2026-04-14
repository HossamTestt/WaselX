/**
 * Users Controller
 */
const { sequelize } = require('../../config/database');
const { QueryTypes } = require('sequelize');
const { sendPushNotification } = require('../../services/notificationService');

exports.listUsers = async (req, res, next) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const replacements = { limit: parseInt(limit), offset: parseInt(offset) };
    let where = 'WHERE u.role != :adminRole';
    replacements.adminRole = 'admin';
    if (role) { where += ' AND u.role = :role'; replacements.role = role; }
    if (status) { where += ' AND u.status = :status'; replacements.status = status; }

    const users = await sequelize.query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.created_at,
              u.verification_status, u.verification_type,
              cp.company_name, cp.vehicle_type, cp.is_verified, cp.rating
       FROM users u LEFT JOIN carrier_profiles cp ON cp.user_id = u.id
       ${where} ORDER BY u.created_at DESC LIMIT :limit OFFSET :offset`,
      { replacements, type: QueryTypes.SELECT }
    );
    const [{ total }] = await sequelize.query(
      `SELECT COUNT(*) as total FROM users u ${where}`,
      { replacements, type: QueryTypes.SELECT }
    );
    res.json({ success: true, data: users, pagination: { total: parseInt(total), page: parseInt(page), limit: parseInt(limit) } });
  } catch (e) { next(e); }
};

exports.getUser = async (req, res, next) => {
  try {
    const [user] = await sequelize.query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.profile_photo_url, u.created_at,
              u.verification_status, u.verification_type, u.verification_doc_url,
              cp.company_name, cp.vehicle_type, cp.vehicle_capacity, cp.license_plate,
              cp.is_verified, cp.rating, cp.total_trips
       FROM users u LEFT JOIN carrier_profiles cp ON cp.user_id = u.id WHERE u.id = :id`,
      { replacements: { id: req.params.id }, type: QueryTypes.SELECT }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (e) { next(e); }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'pending', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    await sequelize.query('UPDATE users SET status = :status WHERE id = :id',
      { replacements: { status, id: req.params.id }, type: QueryTypes.UPDATE });
    res.json({ success: true, message: `User status updated to '${status}'` });

    // Notify User
    if (status === 'active') {
      sendPushNotification(
        req.params.id,
        'Welcome to WaselX! 🚀',
        'Your account has been approved. You can now start using the platform.',
        { type: 'account_approved' }
      );
    } else if (status === 'suspended') {
      sendPushNotification(
        req.params.id,
        'Account Suspended ⚠️',
        'Your account has been suspended. Please contact support for more information.',
        { type: 'account_suspended' }
      );
    }
  } catch (e) { next(e); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, company_name, vehicle_type, vehicle_capacity, license_plate } = req.body;
    await sequelize.query(
      'UPDATE users SET name = COALESCE(:name, name), phone = COALESCE(:phone, phone) WHERE id = :id',
      { replacements: { name, phone, id: req.user.id }, type: QueryTypes.UPDATE }
    );
    if (req.user.role === 'carrier') {
      await sequelize.query(
        `UPDATE carrier_profiles SET 
           company_name = COALESCE(:company_name, company_name),
           vehicle_type = COALESCE(:vehicle_type, vehicle_type),
           vehicle_capacity = COALESCE(:vehicle_capacity, vehicle_capacity),
           license_plate = COALESCE(:license_plate, license_plate)
         WHERE user_id = :userId`,
        { replacements: { company_name, vehicle_type, vehicle_capacity, license_plate, userId: req.user.id }, type: QueryTypes.UPDATE }
      );
    }
    res.json({ success: true, message: 'Profile updated' });
  } catch (e) { next(e); }
};

exports.updateVerificationStatus = async (req, res, next) => {
  try {
    const { verification_status, verification_type } = req.body;
    if (verification_status && !['not_started', 'pending_review', 'verified', 'rejected'].includes(verification_status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }
    
    await sequelize.query(
      `UPDATE users SET 
        verification_status = COALESCE(:verification_status, verification_status),
        verification_type = COALESCE(:verification_type, verification_type)
       WHERE id = :id`,
      { replacements: { verification_status, verification_type, id: req.params.id }, type: QueryTypes.UPDATE }
    );

    // If verified, also update carrier_profile is_verified
    if (verification_status === 'verified') {
      await sequelize.query(
        'UPDATE carrier_profiles SET is_verified = TRUE WHERE user_id = :id',
        { replacements: { id: req.params.id }, type: QueryTypes.UPDATE }
      );
    }

    res.json({ success: true, message: 'Verification status updated' });

    // Notify User
    if (verification_status === 'verified') {
      sendPushNotification(
        req.params.id,
        'Identity Verified! ✅',
        'Your documents have been verified. You are now a trusted partner.',
        { type: 'verification_success' }
      );
    } else if (verification_status === 'rejected') {
      sendPushNotification(
        req.params.id,
        'Verification Update 📋',
        'Your identification documents were not accepted. Please re-upload clear copies.',
        { type: 'verification_rejected' }
      );
    }
  } catch (e) { next(e); }
};
