const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  getUserById,
  listUsers,
} = require('../controllers/userController');

// IMPORTANT: /me must come before /:id, otherwise Express treats "me" as an :id param
router.get('/me', protect, getProfile);
router.get('/', protect, listUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateProfile);

module.exports = router;