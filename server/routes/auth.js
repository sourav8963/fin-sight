import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { User, Habit, Goal, Asset } from '../models/Schemas.js';
import { auth } from '../middleware/auth.js';

// Setup Nodemailer SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const sendEmailNotification = async (to, subject, text, html) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[MOCK EMAIL LOGGED] SMTP credentials omitted in .env.`);
      console.log(`To: ${to}\nSubject: ${subject}\nBody: ${text}\n-----------------------`);
      return;
    }

    await transporter.sendMail({
      from: `"FinSight Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`[EMAIL SENT] Notification delivered successfully to ${to}`);
  } catch (err) {
    console.error('[MAILER ERROR] Failed to dispatch email:', err.message);
  }
};

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretspecialjwtsecretkey12345!';

// Seeding default templates for new users
export const seedNewUserData = async (userId) => {
  try {
    const today = new Date();
    const getPastDateStr = (daysAgo) => {
      const d = new Date();
      d.setDate(today.getDate() - daysAgo);
      return d.toISOString().slice(0, 10);
    };

    // 1. Add Default Habits with starter streaks
    const habit1 = new Habit({
      userId,
      name: 'Save Daily ($10)',
      frequency: 'daily',
      streak: 3,
      lastCompleted: getPastDateStr(1),
      completionHistory: [getPastDateStr(3), getPastDateStr(2), getPastDateStr(1)]
    });
    const habit2 = new Habit({
      userId,
      name: 'Log Daily Expenses',
      frequency: 'daily',
      streak: 4,
      lastCompleted: getPastDateStr(1),
      completionHistory: [getPastDateStr(4), getPastDateStr(3), getPastDateStr(2), getPastDateStr(1)]
    });
    const habit3 = new Habit({
      userId,
      name: 'Invest Monthly',
      frequency: 'monthly',
      streak: 1,
      lastCompleted: getPastDateStr(15),
      completionHistory: [getPastDateStr(15)]
    });
    await Promise.all([habit1.save(), habit2.save(), habit3.save()]);

    // 2. Add Default Goals with contributions
    const goal1 = new Goal({
      userId,
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 4000,
      targetDate: getPastDateStr(-180), // 6 months in future
      category: 'Emergency',
      contributions: [
        { date: getPastDateStr(30), amount: 2000, note: 'Initial deposit' },
        { date: getPastDateStr(15), amount: 2000, note: 'Monthly savings match' }
      ]
    });
    const goal2 = new Goal({
      userId,
      name: 'Vacation Fund',
      targetAmount: 5000,
      currentAmount: 1500,
      targetDate: getPastDateStr(-120), // 4 months in future
      category: 'Travel',
      contributions: [
        { date: getPastDateStr(25), amount: 1000, note: 'Onboarding deposit' },
        { date: getPastDateStr(5), amount: 500, note: 'Birthday gift' }
      ]
    });
    await Promise.all([goal1.save(), goal2.save()]);

    // 3. Add Default Assets & Liabilities
    await Asset.insertMany([
      { userId, name: 'Chase Checking Account', category: 'Cash', amount: 3500 },
      { userId, name: 'Fidelity Stock Brokerage', category: 'Investment', amount: 4800 },
      { userId, name: 'Physical Gold Bars', category: 'Gold', amount: 2500 },
      { userId, name: 'Capital One Credit Card', category: 'Liabilities', amount: -600 }
    ]);

    // 4. Add Default Bills & Reminders
    await Bill.insertMany([
      { userId, name: 'Water & Electricity Utility', amount: 120, dueDate: getPastDateStr(-5), category: 'Utilities', status: 'unpaid' },
      { userId, name: 'High-speed Fiber Internet', amount: 65, dueDate: getPastDateStr(-12), category: 'Utilities', status: 'unpaid' },
      { userId, name: 'Adobe Creative Suite', amount: 55, dueDate: getPastDateStr(-20), category: 'Entertainment', status: 'paid' }
    ]);

    // 5. Add dynamic Transactions ledger history spanning 3 months for charts
    await Transaction.insertMany([
      // Month 0 (Current Month)
      { userId, date: getPastDateStr(2), amount: 4500, category: 'Salary', type: 'income', note: 'Monthly Salary Paycheck' },
      { userId, date: getPastDateStr(1), amount: 1200, category: 'Rent', type: 'expense', note: 'Apartment Rental Lease' },
      { userId, date: getPastDateStr(3), amount: 150, category: 'Food', type: 'expense', note: 'Weekly WholeFoods Groceries' },
      { userId, date: getPastDateStr(4), amount: 300, category: 'Freelance', type: 'income', note: 'Vite React Consultation Gig' },
      { userId, date: getPastDateStr(5), amount: 500, category: 'Investment', type: 'expense', note: 'Fidelity Mutual Fund Match' },
      
      // Month 1 (Last Month)
      { userId, date: getPastDateStr(32), amount: 4500, category: 'Salary', type: 'income', note: 'Monthly Salary Paycheck' },
      { userId, date: getPastDateStr(31), amount: 1200, category: 'Rent', type: 'expense', note: 'Apartment Rental Lease' },
      { userId, date: getPastDateStr(35), amount: 180, category: 'Food', type: 'expense', note: 'Sushi Dinner & Groceries' },
      { userId, date: getPastDateStr(45), amount: 200, category: 'Utilities', type: 'expense', note: 'Utility Bill Power/Grid' },
      
      // Month 2 (2 Months Ago)
      { userId, date: getPastDateStr(62), amount: 4500, category: 'Salary', type: 'income', note: 'Monthly Salary Paycheck' },
      { userId, date: getPastDateStr(61), amount: 1200, category: 'Rent', type: 'expense', note: 'Apartment Rental Lease' },
      { userId, date: getPastDateStr(65), amount: 110, category: 'Transport', type: 'expense', note: 'Gasoline and Subway Card' },
      { userId, date: getPastDateStr(70), amount: 150, category: 'Entertainment', type: 'expense', note: 'Concert ticket purchase' }
    ]);

    // Update user XP & award starting badge
    const user = await User.findById(userId);
    if (user) {
      user.xp = 150; // starting XP level
      user.badges = ['Streak Starter', 'Consistency Champion'];
      await user.save();
    }
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

    const verifyLink = `http://localhost:5173/api/auth/verify-email/${verificationToken}`;
    await sendEmailNotification(
      email,
      'Verify your FinSight Account',
      `Welcome to FinSight! Click here to verify your email address: ${verifyLink}`,
      `<p>Welcome to FinSight!</p><p>Please click the link below to verify your email address:</p><a href="${verifyLink}">Verify Account</a>`
    );

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

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    await sendEmailNotification(
      email,
      'Reset your FinSight Password',
      `You requested a password reset. Click here to reset your password: ${resetLink}`,
      `<p>You requested a password reset.</p><p>Please click the link below to reset your password:</p><a href="${resetLink}">Reset Password</a>`
    );

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

