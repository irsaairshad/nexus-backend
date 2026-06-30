const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get logged-in user's profile
// @route   GET /api/users/me
exports.getProfile = async (req, res) => {
  try {
    // req.user is already attached by the protect middleware
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
exports.updateProfile = async (req, res) => {
  try {
    // Only allow a user to update their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const updates = { ...req.body };

    // Never allow updating these fields directly through this route
    delete updates.password;
    delete updates.role;
    delete updates.email;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single user by id (e.g. viewing another entrepreneur/investor profile)
// @route   GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List all entrepreneurs or investors (for browsing pages)
// @route   GET /api/users?role=entrepreneur
exports.listUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};