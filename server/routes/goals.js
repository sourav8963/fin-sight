import express from 'express';
import { Goal, Transaction } from '../models/Schemas.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/goals
// @desc    Get all savings goals for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const list = await Goal.find({ userId: req.user._id });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving goals.' });
  }
});

// @route   POST /api/goals
// @desc    Create a new savings goal
router.post('/', auth, async (req, res) => {
  try {
    const { name, targetAmount, targetDate, category } = req.body;

    if (!name || !targetAmount || !targetDate || !category) {
      return res.status(400).json({ error: 'Please supply all required fields.' });
    }

    const newGoal = new Goal({
      userId: req.user._id,
      name,
      targetAmount: Number(targetAmount),
      targetDate,
      category,
      currentAmount: 0,
      contributions: []
    });

    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (err) {
    res.status(500).json({ error: 'Server error setup goal.', details: err.message });
  }
});

// @route   POST /api/goals/contribute/:id
// @desc    Add a contribution to a savings goal
router.post('/contribute/:id', auth, async (req, res) => {
  try {
    const { amount, note } = req.body;
    const parsedAmt = Number(amount);

    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      return res.status(400).json({ error: 'Please supply a valid contribution amount.' });
    }

    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ error: 'Savings goal not found or unauthorized.' });
    }

    // Insert transaction expense as contribution
    const autoTx = new Transaction({
      userId: req.user._id,
      date: new Date().toISOString().slice(0, 10),
      amount: parsedAmt,
      category: 'Other',
      type: 'expense',
      note: `Savings Goal Contribution: ${goal.name}`
    });

    await autoTx.save();

    const contribution = {
      amount: parsedAmt,
      date: new Date().toISOString().slice(0, 10),
      note: note || 'Goal deposit'
    };

    goal.currentAmount += parsedAmt;
    goal.contributions.unshift(contribution);
    await goal.save();

    res.json({
      goal,
      transaction: autoTx
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error logging goal contribution.', details: err.message });
  }
});

// @route   DELETE /api/goals/:id
// @desc    Delete a savings goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found or unauthorized.' });
    }
    res.json({ success: true, message: 'Goal deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting goal.' });
  }
});

export default router;
