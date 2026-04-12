/**
 * Auth Controller
 * Handles registration, login, token refresh, UAE PASS placeholder
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const { sequelize } = require('../../config/database');
const { QueryTypes } = require('sequelize');

/**
 * Generate JWT access + refresh token pair
 */
function generateTokens(user) {
  const payload = { id: user.id, email: user.email, role: user.role };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

  return { accessToken, refreshToken };
}

/**
 * POST /api/auth/register
 * Register a new shipper or carrier
 */
exports.register = async (req, res, next) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, password, role } = req.body;

    // Only shippers and carriers can self-register
    if (!['shipper', 'carrier'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Check if email already exists
    const existing = await sequelize.query(
      'SELECT id FROM users WHERE email = :email',
      { replacements: { email }, type: QueryTypes.SELECT }
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Carriers start as 'pending' until admin approves
    const status = role === 'carrier' ? 'pending' : 'active';

    // Insert user
    const [newUser] = await sequelize.query(
      `INSERT INTO users (id, name, email, phone, password_hash, role, status)
       VALUES (:id, :name, :email, :phone, :password_hash, :role, :status)
       RETURNING id, name, email, phone, role, status, created_at`,
      {
        replacements: { id: uuidv4(), name, email, phone, password_hash, role, status },
        type: QueryTypes.INSERT,
      }
    );

    // If carrier, create empty profile entry
    if (role === 'carrier') {
      await sequelize.query(
        `INSERT INTO carrier_profiles (user_id, vehicle_type) VALUES (:userId, 'Unknown')`,
        { replacements: { userId: newUser[0]?.id || req.body.id }, type: QueryTypes.INSERT }
      );
    }

    // Fetch the created user for response
    const [user] = await sequelize.query(
      'SELECT id, name, email, phone, role, status, created_at FROM users WHERE email = :email',
      { replacements: { email }, type: QueryTypes.SELECT }
    );

    const tokens = generateTokens(user);

    res.status(201).json({
      success: true,
      message: role === 'carrier'
        ? 'Registration successful. Pending admin approval.'
        : 'Registration successful.',
      data: { user, ...tokens },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and return JWT tokens
 */
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Fetch user with password hash
    const users = await sequelize.query(
      'SELECT id, name, email, phone, role, status, password_hash, fcm_token FROM users WHERE email = :email',
      { replacements: { email }, type: QueryTypes.SELECT }
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if carrier is approved
    if (user.role === 'carrier' && user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval. You will be notified via email.',
        code: 'PENDING_APPROVAL',
      });
    }

    if (user.status === 'suspended' || user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
        code: 'ACCOUNT_SUSPENDED',
      });
    }

    const { password_hash, ...safeUser } = user;
    const tokens = generateTokens(safeUser);

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: safeUser, ...tokens },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    res.json({ success: true, data: { accessToken } });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 */
exports.getMe = async (req, res, next) => {
  try {
    const users = await sequelize.query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.profile_photo_url, u.created_at,
              cp.company_name, cp.vehicle_type, cp.is_verified, cp.rating, cp.total_trips
       FROM users u
       LEFT JOIN carrier_profiles cp ON cp.user_id = u.id
       WHERE u.id = :id`,
      { replacements: { id: req.user.id }, type: QueryTypes.SELECT }
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: users[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/uaepass
 * UAE PASS OAuth integration placeholder
 * In production, exchange the code for user data via UAE PASS API
 */
exports.uaepass = async (req, res, next) => {
  try {
    const { code, role } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'UAE PASS authorization code required' });
    }

    // --- PLACEHOLDER ---
    // In production:
    // 1. Exchange `code` for access_token via UAE PASS token endpoint
    // 2. Fetch user profile (name, Emirates ID, email, phone) from UAE PASS
    // 3. Find or create local user record
    // 4. Return WaselX JWT tokens

    return res.status(501).json({
      success: false,
      message: 'UAE PASS integration coming soon. Please use email/password login.',
      code: 'UAEPASS_NOT_IMPLEMENTED',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/auth/fcm-token
 * Update Firebase Cloud Messaging push notification token
 */
exports.updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    await sequelize.query(
      'UPDATE users SET fcm_token = :fcmToken WHERE id = :id',
      { replacements: { fcmToken, id: req.user.id }, type: QueryTypes.UPDATE }
    );
    res.json({ success: true, message: 'FCM token updated' });
  } catch (error) {
    next(error);
  }
};
