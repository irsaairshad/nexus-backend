const Meeting = require('../models/Meeting');

// @desc    Schedule a new meeting
// @route   POST /api/meetings
exports.scheduleMeeting = async (req, res) => {
  try {
    const { title, scheduledWith, date, startTime, endTime, message } = req.body;
    const scheduledBy = req.user._id;

    // Conflict detection — check if either user has a meeting at same time
    const conflict = await Meeting.findOne({
      date: new Date(date),
      status: { $in: ['pending', 'accepted'] },
      $or: [
        { scheduledBy, $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }] },
        { scheduledWith: scheduledBy, $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }] },
        { scheduledBy: scheduledWith, $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }] },
        { scheduledWith, $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }] },
      ]
    });

    if (conflict) {
      return res.status(400).json({ message: 'Time slot conflict — one of the users already has a meeting at this time' });
    }

    const meeting = await Meeting.create({
      title, scheduledBy, scheduledWith,
      date: new Date(date),
      startTime, endTime, message
    });

    await meeting.populate(['scheduledBy', 'scheduledWith'], 'name email avatarUrl role');
    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all meetings for logged-in user
// @route   GET /api/meetings
exports.getMyMeetings = async (req, res) => {
  try {
    const userId = req.user._id;
    const meetings = await Meeting.find({
      $or: [{ scheduledBy: userId }, { scheduledWith: userId }]
    })
      .populate('scheduledBy', 'name email avatarUrl role')
      .populate('scheduledWith', 'name email avatarUrl role')
      .sort({ date: 1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept a meeting
// @route   PUT /api/meetings/:id/accept
exports.acceptMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    // Only the person who was invited can accept
    if (meeting.scheduledWith.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this meeting' });
    }

    meeting.status = 'accepted';
    await meeting.save();
    await meeting.populate(['scheduledBy', 'scheduledWith'], 'name email avatarUrl role');
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a meeting
// @route   PUT /api/meetings/:id/reject
exports.rejectMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    if (meeting.scheduledWith.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this meeting' });
    }

    meeting.status = 'rejected';
    await meeting.save();
    res.json({ message: 'Meeting rejected', meeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a meeting
// @route   PUT /api/meetings/:id/cancel
exports.cancelMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    // Only the person who scheduled can cancel
    if (meeting.scheduledBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this meeting' });
    }

    meeting.status = 'cancelled';
    await meeting.save();
    res.json({ message: 'Meeting cancelled', meeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};