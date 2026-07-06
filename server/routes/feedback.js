import express from 'express';
import { Feedback, User } from '../models/Schemas.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/feedback
// @desc    Submit user feedback/suggestion/complaint
router.post('/', auth, async (req, res) => {
  try {
    const { type, message } = req.body;

    if (!type || !message) {
      return res.status(400).json({ error: 'Type and message description are required.' });
    }

    const newFb = new Feedback({
      userId: req.user._id.toString(),
      userName: req.user.name,
      type,
      message,
      status: 'pending'
    });

    await newFb.save();
    res.status(201).json(newFb);
  } catch (err) {
    res.status(500).json({ error: 'Server error logging feedback.', details: err.message });
  }
});

// @route   GET /api/feedback
// @desc    Get user's own feedback list
router.get('/', auth, async (req, res) => {
  try {
    const list = await Feedback.find({ userId: req.user._id.toString() }).sort({ date: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving feedback.' });
  }
});

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================

// @route   GET /api/feedback/admin/all
// @desc    Get all feedback tickets (admin only)
router.get('/admin/all', auth, adminOnly, async (req, res) => {
  try {
    const list = await Feedback.find({}).sort({ date: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving admin feedback.' });
  }
});

// @route   POST /api/feedback/admin/resolve/:id
// @desc    Resolve and reply to feedback ticket (admin only)
router.post('/admin/resolve/:id', auth, adminOnly, async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({ error: 'Reply text is required.' });
    }

    const ticket = await Feedback.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    ticket.status = 'resolved';
    ticket.reply = reply.trim();
    await ticket.save();

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Server error resolving feedback ticket.', details: err.message });
  }
});

// @route   GET /api/feedback/admin/users
// @desc    Get all users list (admin only)
router.get('/admin/users', auth, adminOnly, async (req, res) => {
  try {
    const list = await User.find({}, '-password'); // exclude hashed password
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving user accounts.' });
  }
});

// @route   POST /api/feedback/admin/users/:id/status
// @desc    Toggle user status Active/Suspended (admin only)
router.post('/admin/users/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    // Toggle status
    user.status = user.status === 'Active' ? 'Suspended' : 'Active';
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error toggling user status.' });
  }
});

// @route   POST /api/feedback/admin/users/:id/role
// @desc    Change user role admin/viewer (admin only)
router.post('/api/feedback/admin/users/:id/role', auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['viewer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Please supply a valid role.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    user.role = role;
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating user role.' });
  }
});

export default router;
