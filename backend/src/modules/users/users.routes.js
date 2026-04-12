const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/', authorize('admin'), usersController.listUsers);
router.get('/:id', usersController.getUser);
router.patch('/:id/status', authorize('admin'), usersController.updateUserStatus);
router.patch('/:id/verify', authorize('admin'), usersController.updateVerificationStatus);
router.patch('/profile', usersController.updateProfile);

module.exports = router;
