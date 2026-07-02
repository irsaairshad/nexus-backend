const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  scheduleMeeting,
  getMyMeetings,
  acceptMeeting,
  rejectMeeting,
  cancelMeeting,
} = require('../controllers/meetingController');

router.post('/', protect, scheduleMeeting);
router.get('/', protect, getMyMeetings);
router.put('/:id/accept', protect, acceptMeeting);
router.put('/:id/reject', protect, rejectMeeting);
router.put('/:id/cancel', protect, cancelMeeting);

module.exports = router;