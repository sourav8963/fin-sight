import express from 'express';
import { Bill, Transaction } from '../models/Schemas.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/bills
// @desc    Get all upcoming bills for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const list = await Bill.find({ userId: req.user._id }).sort({ dueDate: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving bills.' });
  }
});

// @route   POST /api/bills
// @desc    Create a new bill reminder
router.post('/', auth, async (req, res) => {
  try {
    const { name, amount, dueDate, category } = req.body;

    if (!name || !amount || !dueDate) {
      return res.status(400).json({ error: 'Name, amount, and due date are required.' });
    }

    const newBill = new Bill({
      userId: req.user._id,
      name,
      amount: Number(amount),
      dueDate,
      category: category || 'Utilities',
      status: 'unpaid'
    });

    await newBill.save();
    res.status(201).json(newBill);
  } catch (err) {
    res.status(500).json({ error: 'Server error creating bill.', details: err.message });
  }
});

// @route   PUT /api/bills/:id
// @desc    Update a bill reminder
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, amount, dueDate, category, status } = req.body;

    const bill = await Bill.findOne({ _id: req.params.id, userId: req.user._id });
    if (!bill) {
      return res.status(404).json({ error: 'Bill reminder not found.' });
    }

    if (name) bill.name = name;
    if (amount !== undefined) bill.amount = Number(amount);
    if (dueDate) bill.dueDate = dueDate;
    if (category) bill.category = category;
    if (status) bill.status = status;

    await bill.save();
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: 'Server error updating bill.' });
  }
});

// @route   POST /api/bills/pay/:id
// @desc    Mark bill as paid and write to transactions ledger
router.post('/pay/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, userId: req.user._id });
    if (!bill) {
      return res.status(404).json({ error: 'Bill reminder not found.' });
    }

    if (bill.status === 'paid') {
      return res.status(400).json({ error: 'Bill has already been paid.' });
    }

    bill.status = 'paid';
    await bill.save();

    // Automatically create a ledger transaction
    const autoTx = new Transaction({
      userId: req.user._id,
      date: new Date().toISOString().slice(0, 10),
      amount: bill.amount,
      category: bill.category || 'Utilities',
      type: 'expense',
      note: `Bill Paid: ${bill.name}`
    });

    await autoTx.save();

    res.json({
      bill,
      transaction: autoTx
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error processing bill payment.', details: err.message });
  }
});

// @route   DELETE /api/bills/:id
// @desc    Delete a bill reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    const bill = await Bill.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!bill) {
      return res.status(404).json({ error: 'Bill reminder not found.' });
    }
    res.json({ success: true, message: 'Bill reminder deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting bill.' });
  }
});

export default router;
