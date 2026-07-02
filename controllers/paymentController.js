const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/Transaction');

// @desc    Create payment intent (deposit)
// @route   POST /api/payments/deposit
exports.createDeposit = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 1) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Create Stripe PaymentIntent (amount in cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: { userId: req.user._id.toString() },
    });

    // Save transaction as pending
    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'deposit',
      amount,
      status: 'pending',
      stripePaymentIntentId: paymentIntent.id,
      description: `Deposit of $${amount}`,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      transactionId: transaction._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm payment (simulate completion)
// @route   POST /api/payments/confirm
exports.confirmPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    transaction.status = 'completed';
    await transaction.save();

    res.json({ message: 'Payment confirmed successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Simulate withdrawal
// @route   POST /api/payments/withdraw
exports.createWithdrawal = async (req, res) => {
  try {
    const { amount, description } = req.body;
    if (!amount || amount < 1) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'withdrawal',
      amount,
      status: 'completed',
      description: description || `Withdrawal of $${amount}`,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Simulate transfer to another user
// @route   POST /api/payments/transfer
exports.createTransfer = async (req, res) => {
  try {
    const { amount, recipientId, description } = req.body;
    if (!amount || amount < 1) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'transfer',
      amount,
      status: 'completed',
      recipientId,
      description: description || `Transfer of $${amount}`,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transaction history
// @route   GET /api/payments/transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('recipientId', 'name email');

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};