const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const validateUpdateUser = require('../middleware/validate.middleware');
const {
  getCurrentUser,
  updateUserInfo,
  deleteAccount,
  deactivateAccount,
} = require('../controllers/user.controller');

// GET /api/users/me - Get current authenticated user
router.get('/me', auth, getCurrentUser);

// PUT /api/users - Update user info (firstname and lastname)
router.put('/', auth, validateUpdateUser, updateUserInfo);

// DELETE /api/users - Soft delete/deactivate account
router.delete('/', auth, deleteAccount);

// PUT /api/users/deactivate - Deactivate account
router.put('/deactivate', auth, deactivateAccount);

module.exports = router;