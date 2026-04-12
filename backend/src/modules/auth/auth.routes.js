/**
 * Auth Routes
 * POST /api/auth/*
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// Validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase letter and number'),
  body('role').isIn(['shipper', 'carrier']).withMessage('Role must be shipper or carrier'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post('/register', registerRules, authController.register);
router.post('/login', loginRules, authController.login);
router.post('/refresh', authController.refresh);
router.post('/uaepass', authController.uaepass);
router.get('/me', authenticate, authController.getMe);
router.patch('/fcm-token', authenticate, authController.updateFcmToken);

module.exports = router;
