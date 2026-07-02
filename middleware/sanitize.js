const { body, validationResult } = require('express-validator');

// Validation rules for registration
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['entrepreneur', 'investor']).withMessage('Role must be entrepreneur or investor'),
];

// Validation rules for login
const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['entrepreneur', 'investor']).withMessage('Invalid role'),
];

// Validation rules for meeting scheduling
const validateMeeting = [
  body('title').trim().notEmpty().withMessage('Title is required').escape(),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('endTime').notEmpty().withMessage('End time is required'),
  body('scheduledWith').notEmpty().withMessage('Recipient is required'),
];

// Validation rules for payment
const validatePayment = [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
];

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateMeeting,
  validatePayment,
  handleValidationErrors,
};