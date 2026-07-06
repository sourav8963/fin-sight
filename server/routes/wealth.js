import express from 'express';
import { Asset, Transaction } from '../models/Schemas.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Helper to backtrack net worth history for the last 6 months
const calculateNetWorthHistory = async (userId, currentNetWorth) => {
  const history = [];
  const now = new Date();
  
  // Fetch all transactions for this user sorted descending by date
  const txs = await Transaction.find({ userId }).sort({ date: -1 });

  // Generate the last 6 months labels
  const monthLabels = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    const yearMonth = d.toISOString().slice(0, 7); // yyyy-MM
    monthLabels.push({ label, yearMonth });
  }

  // Backtrack starting from current net worth
  let runningNetWorth = currentNetWorth;
  
  // Map historical snapshots in reverse
  for (let i = monthLabels.length - 1; i >= 0; i--) {
    const { label, yearMonth } = monthLabels[i];
    
    // Find all transactions that occurred *after* this month's end date
    // (meaning we subtract them from current net worth to go backward in time)
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1)
      .toISOString()
      .slice(0, 10);
    
    // Transactions in the future relative to the snapshot month
    const futureTxs = txs.filter((t) => t.date >= yearMonth + '-31');

    const netSavingsSinceThen = futureTxs.reduce((sum, t) => {
      if (t.type === 'income') {
        return sum + t.amount;
      } else {
        return sum - t.amount;
      }
    }, 0);

    const snapshotNetWorth = currentNetWorth - netSavingsSinceThen;

    history.push({
      month: label,
      netWorth: Math.max(0, snapshotNetWorth),
      assets: Math.max(0, snapshotNetWorth + 5000), // simulate liability padding
      liabilities: 5000
    });
  }

  return history;
};

// @route   GET /api/wealth/assets
// @desc    Get all assets & liabilities
router.get('/assets', auth, async (req, res) => {
  try {
    const list = await Asset.find({ userId: req.user._id });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving assets.' });
  }
});

// @route   POST /api/wealth/assets
// @desc    Create a new asset or liability record
router.post('/assets', auth, async (req, res) => {
  try {
    const { name, category, amount } = req.body;

    if (!name || !category || amount === undefined) {
      return res.status(400).json({ error: 'Please provide name, category, and amount.' });
    }

    const newAsset = new Asset({
      userId: req.user._id,
      name,
      category,
      amount: Number(amount)
    });

    await newAsset.save();
    res.status(201).json(newAsset);
  } catch (err) {
    res.status(500).json({ error: 'Server error saving asset record.', details: err.message });
  }
});

// @route   PUT /api/wealth/assets/:id
// @desc    Update asset amount
router.put('/assets/:id', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount === undefined) {
      return res.status(400).json({ error: 'Amount is required.' });
    }

    const asset = await Asset.findOne({ _id: req.params.id, userId: req.user._id });
    if (!asset) {
      return res.status(404).json({ error: 'Asset record not found or unauthorized.' });
    }

    asset.amount = Number(amount);
    asset.lastUpdated = new Date().toISOString().slice(0, 10);

    await asset.save();
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: 'Server error updating asset.', details: err.message });
  }
});

// @route   DELETE /api/wealth/assets/:id
// @desc    Delete asset record
router.delete('/assets/:id', auth, async (req, res) => {
  try {
    const asset = await Asset.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!asset) {
      return res.status(404).json({ error: 'Asset record not found.' });
    }
    res.json({ success: true, message: 'Asset record deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting asset.' });
  }
});

// @route   GET /api/wealth/history
// @desc    Retrieve dynamic historical net worth snapshots
router.get('/history', auth, async (req, res) => {
  try {
    const userAssets = await Asset.find({ userId: req.user._id });
    
    let totalAssets = 0;
    let totalLiabilities = 0;
    userAssets.forEach((a) => {
      if (a.category === 'Liabilities') {
        totalLiabilities += a.amount;
      } else {
        totalAssets += a.amount;
      }
    });

    const netWorth = totalAssets - totalLiabilities;
    const history = await calculateNetWorthHistory(req.user._id, netWorth);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Server error backtracking net worth history.', details: err.message });
  }
});

// @route   GET /api/wealth/roi
// @desc    Calculate portfolio ROI percentage based on current investments vs. principal transactions
router.get('/roi', auth, async (req, res) => {
  try {
    const userAssets = await Asset.find({ userId: req.user._id, category: 'Investment' });
    const currentInvestmentValue = userAssets.reduce((sum, a) => sum + a.amount, 0);

    // Fetch transactions of category "Investment" that were expenses (capital invested)
    const investmentTxs = await Transaction.find({
      userId: req.user._id,
      category: 'Investment',
      type: 'expense'
    });

    const investedCapital = investmentTxs.reduce((sum, t) => sum + t.amount, 0);

    let roiPercentage = 0;
    if (investedCapital > 0) {
      roiPercentage = ((currentInvestmentValue - investedCapital) / investedCapital) * 100;
    }

    res.json({
      currentValue: currentInvestmentValue,
      investedCapital,
      roi: roiPercentage,
      gain: currentInvestmentValue - investedCapital
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error calculating investment ROI.' });
  }
});

export default router;
