const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendRequest,
  getMyRequests,
  acceptRequest,
  rejectRequest,
} = require('../controllers/collaborationController');

router.post('/', protect, sendRequest);
router.get('/', protect, getMyRequests);
router.put('/:id/accept', protect, acceptRequest);
router.put('/:id/reject', protect, rejectRequest);

module.exports = router;