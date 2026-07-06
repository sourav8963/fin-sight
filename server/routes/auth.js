import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Habit, Goal, Asset } from '../models/Schemas.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretspecialjwtsecretkey12345!';

// Seeding default templates for new users
const seedNewUserData = async (userId) => {
  try {
    // 1. Add Default Habits
    await Habit.insertMany([
      { userId, name: 'Save Daily ($10)', frequency: 'daily', streak: 0, completionHistory: [] },
      { userId, name: 'Log Daily Expenses', frequency: 'daily', streak: 0, completionHistory: [] },
      { userId, name: 'Invest Monthly', frequency: 'monthly', streak: 0, completionHistory: [] }
    ]);

    // 2. Add Default Goals
    await Goal.insertMany([
      { userId, name: 'Emergency Fund', targetAmount: 10000, currentAmount: 0, targetDate: '2026-12-31', category: 'Emergency', contributions: [] },
      { userId, name: 'Vacation Fund', targetAmount: 5000, currentAmount: 0, targetDate: '2027-06-30', category: 'Travel', contributions: [] }
    ]);

    // 3. Add Default Assets
    await Asset.insertMany([
      { userId, name: 'Savings Account', category: 'Cash', amount: 500 },
      { userId, name: 'Investment Brokerage', category: 'Investment', amount: 0 }
    ]);
  } catch (err) {
    console.error('Failed to seed default onboarding data for user:', userId, err.message);
  }
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });

    user = new User({
      name,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      verificationToken,
      verified: false
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Seed default habits, goals, assets
    await seedNewUserData(user._id);

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    // Log mock verification token in console
    console.log(`[MOCK EMAIL SENT] Verification URL: http://localhost:5173/api/auth/verify-email/${verificationToken}`);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetSavingsRate: user.targetSavingsRate,
        role: user.role,
        avatar: user.avatar,
        joinedDate: user.joinedDate,
        xp: user.xp,
        badges: user.badges
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server registration error.', details: err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter all credentials.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ error: 'Account suspended. Contact administration.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetSavingsRate: user.targetSavingsRate,
        role: user.role,
        avatar: user.avatar,
        joinedDate: user.joinedDate,
        xp: user.xp,
        badges: user.badges
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server authentication error.', details: err.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get currently logged-in user profile
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      targetSavingsRate: req.user.targetSavingsRate,
      role: req.user.role,
      avatar: req.user.avatar,
      joinedDate: req.user.joinedDate,
      xp: req.user.xp,
      badges: req.user.badges
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving profile.' });
  }
});

// @route   POST /api/auth/profile
// @desc    Update user profile settings
router.post('/profile', auth, async (req, res) => {
  try {
    const { name, email, targetSavingsRate } = req.body;

    if (name) req.user.name = name;
    if (email) req.user.email = email;
    if (targetSavingsRate !== undefined) req.user.targetSavingsRate = Number(targetSavingsRate);

    await req.user.save();

    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      targetSavingsRate: req.user.targetSavingsRate,
      role: req.user.role,
      avatar: req.user.avatar,
      joinedDate: req.user.joinedDate,
      xp: req.user.xp,
      badges: req.user.badges
    });
  } catch (err) {
    res.status(500).json({ error: 'Server profile update error.', details: err.message });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change password from dashboard
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Please supply current and new passwords.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    req.user.password = await bcrypt.hash(newPassword, salt);
    await req.user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server password modification error.' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Generate a reset token and dispatch mock link
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'No user registered with this email address.' });
    }

    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    console.log(`[MOCK EMAIL SENT] Reset URL: http://localhost:5173/reset-password?token=${resetToken}`);

    res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: 'Server forgot-password error.' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = '';
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Server password reset error.' });
  }
});

// @route   DELETE /api/auth/me
// @desc    Delete user account and all associated data
router.delete('/me', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      Transaction.deleteMany({ userId }),
      Habit.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
      Asset.deleteMany({ userId }),
      User.findByIdAndDelete(userId)
    ]);

    res.json({ success: true, message: 'Account and all associated data deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server account deletion error.', details: err.message });
  }
});

export default router;

