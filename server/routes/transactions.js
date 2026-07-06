import express from 'express';
import { Transaction, User } from '../models/Schemas.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/transactions
// @desc    Get all transactions for logged in user with filters
router.get('/', auth, async (req, res) => {
  try {
    const { search, type, category, sortBy, sortDir, page, limit } = req.query;
    
    let query = { userId: req.user._id };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { category: regex },
        { note: regex }
      ];
    }

    // Sorting
    let sort = {};
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'amount') {
      sort.amount = dir;
    } else {
      sort.date = dir;
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 15;
    const skipNum = (pageNum - 1) * limitNum;

    const total = await Transaction.countDocuments(query);
    const list = await Transaction.find(query)
      .sort(sort)
      .skip(skipNum)
      .limit(limitNum);

    res.json({
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      transactions: list
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching transactions.', details: err.message });
  }
});

// @route   POST /api/transactions
// @desc    Add a new transaction
router.post('/', auth, async (req, res) => {
  try {
    const { date, amount, category, type, note, recurring, recurringPeriod } = req.body;

    if (!date || !amount || !category || !type || !note) {
      return res.status(400).json({ error: 'Please supply all required fields.' });
    }

    const tx = new Transaction({
      userId: req.user._id,
      date,
      amount: Number(amount),
      category,
      type,
      note,
      recurring: !!recurring,
      recurringPeriod: recurringPeriod || 'none'
    });

    await tx.save();

    // Budget Limit check
    let budgetExceededAlert = null;
    if (type === 'expense') {
      const limits = req.user.budgetLimits || new Map();
      const limitAmt = limits.get(category);

      if (limitAmt) {
        // Calculate total expense for this category in the same month (yyyy-MM)
        const monthPrefix = date.slice(0, 7); // yyyy-MM
        const matchRegex = new RegExp('^' + monthPrefix);

        const categoryExpenses = await Transaction.find({
          userId: req.user._id,
          type: 'expense',
          category,
          date: { $regex: matchRegex }
        });

        const totalSpentThisMonth = categoryExpenses.reduce((sum, t) => sum + t.amount, 0);

        if (totalSpentThisMonth > limitAmt) {
          budgetExceededAlert = {
            category,
            limit: limitAmt,
            spent: totalSpentThisMonth,
            message: `Warning: Budget limit for '${category}' (${limitAmt}) exceeded! Total spent: ${totalSpentThisMonth}`
          };
        }
      }
    }

    res.status(201).json({
      success: true,
      transaction: tx,
      alert: budgetExceededAlert
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error adding transaction.', details: err.message });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
router.put('/:id', auth, async (req, res) => {
  try {
    const { date, amount, category, type, note, recurring, recurringPeriod } = req.body;

    let tx = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized.' });
    }

    if (date) tx.date = date;
    if (amount !== undefined) tx.amount = Number(amount);
    if (category) tx.category = category;
    if (type) tx.type = type;
    if (note) tx.note = note;
    if (recurring !== undefined) tx.recurring = !!recurring;
    if (recurringPeriod) tx.recurringPeriod = recurringPeriod;

    await tx.save();

    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: 'Server error modifying transaction.', details: err.message });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized.' });
    }
    res.json({ success: true, message: 'Transaction deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting transaction.' });
  }
});

// @route   POST /api/transactions/budget
// @desc    Set budget limit for a category
router.post('/budget', auth, async (req, res) => {
  try {
    const { category, limit } = req.body;

    if (!category || limit === undefined) {
      return res.status(400).json({ error: 'Category and limit are required.' });
    }

    if (!req.user.budgetLimits) {
      req.user.budgetLimits = new Map();
    }

    req.user.budgetLimits.set(category, Number(limit));
    await req.user.save();

    res.json({
      success: true,
      budgetLimits: Object.fromEntries(req.user.budgetLimits)
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error saving budget limit.', details: err.message });
  }
});

// @route   GET /api/transactions/budget
// @desc    Get all budget limits
router.get('/budget', auth, async (req, res) => {
  try {
    const limits = req.user.budgetLimits ? Object.fromEntries(req.user.budgetLimits) : {};
    res.json(limits);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving budget limits.' });
  }
});

export default router;
