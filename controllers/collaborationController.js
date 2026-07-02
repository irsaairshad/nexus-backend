const CollaborationRequest = require('../models/CollaborationRequest');

// @desc    Send collaboration request
// @route   POST /api/collaborations
exports.sendRequest = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    // Check if request already exists
    const existing = await CollaborationRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    const request = await CollaborationRequest.create({
      sender: senderId,
      receiver: receiverId,
      message,
    });

    await request.populate(['sender', 'receiver'], 'name email avatarUrl role');
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all requests for logged-in user
// @route   GET /api/collaborations
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await CollaborationRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name email avatarUrl role startupName industry')
      .populate('receiver', 'name email avatarUrl role')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept a request
// @route   PUT /api/collaborations/:id/accept
exports.acceptRequest = async (req, res) => {
  try {
    const request = await CollaborationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = 'accepted';
    await request.save();
    await request.populate(['sender', 'receiver'], 'name email avatarUrl role');
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a request
// @route   PUT /api/collaborations/:id/reject
exports.rejectRequest = async (req, res) => {
  try {
    const request = await CollaborationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = 'rejected';
    await request.save();
    res.json({ message: 'Request rejected', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};