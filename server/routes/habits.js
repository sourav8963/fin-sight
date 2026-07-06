import express from 'express';
import { Habit, User } from '../models/Schemas.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Helper to calculate daily habits streak
const calculateStreak = (history) => {
  if (!history || history.length === 0) return 0;
  
  const sorted = [...new Set(history)].sort((a, b) => b.localeCompare(a));
  const todayStr = new Date().toISOString().slice(0, 10);
  
  const tempDate = new Date();
  tempDate.setDate(tempDate.getDate() - 1);
  const yesterdayStr = tempDate.toISOString().slice(0, 10);

  if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let currentDateToCheck = new Date(sorted[0]);

  for (let i = 0; i < sorted.length; i++) {
    const expectedStr = currentDateToCheck.toISOString().slice(0, 10);
    if (sorted.includes(expectedStr)) {
      streak++;
      currentDateToCheck.setDate(currentDateToCheck.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

// Helper to award badges based on streak and achievements
const checkAndAwardBadges = (user, streak, habitsCount) => {
  const newBadges = [];
  const currentBadges = user.badges || [];

  if (streak >= 3 && !currentBadges.includes('Streak Starter')) {
    newBadges.push('Streak Starter');
  }
  if (streak >= 7 && !currentBadges.includes('Consistency Champion')) {
    newBadges.push('Consistency Champion');
  }
  if (streak >= 15 && !currentBadges.includes('Habit Master')) {
    newBadges.push('Habit Master');
  }
  if (streak >= 30 && !currentBadges.includes('Financial Guru')) {
    newBadges.push('Financial Guru');
  }
  if (habitsCount >= 5 && !currentBadges.includes('Multi-Tasker')) {
    newBadges.push('Multi-Tasker');
  }

  return newBadges;
};

// @route   GET /api/habits
// @desc    Get all habits for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const list = await Habit.find({ userId: req.user._id });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving habits.' });
  }
});

// @route   POST /api/habits
// @desc    Create a new habit
router.post('/', auth, async (req, res) => {
  try {
    const { name, frequency } = req.body;

    if (!name || !frequency) {
      return res.status(400).json({ error: 'Name and frequency are required.' });
    }

    const newHabit = new Habit({
      userId: req.user._id,
      name,
      frequency
    });

    await newHabit.save();

    // Check for multi-tasker badge
    const totalHabits = await Habit.countDocuments({ userId: req.user._id });
    if (totalHabits >= 5 && !req.user.badges.includes('Multi-Tasker')) {
      req.user.badges.push('Multi-Tasker');
      req.user.xp += 100; // award 100 XP for unlocking badge
      await req.user.save();
    }

    res.status(201).json(newHabit);
  } catch (err) {
    res.status(500).json({ error: 'Server error creating habit.', details: err.message });
  }
});

// @route   POST /api/habits/toggle/:id
// @desc    Check-in/toggle completion for a habit on a date
router.post('/toggle/:id', auth, async (req, res) => {
  try {
    const { dateStr } = req.body;
    const targetDate = dateStr || new Date().toISOString().slice(0, 10);

    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found or unauthorized.' });
    }

    const history = [...habit.completionHistory];
    const idx = history.indexOf(targetDate);
    
    let xpGained = 0;
    let badgeUnlocked = null;

    if (idx > -1) {
      // Toggle off
      history.splice(idx, 1);
      xpGained = -10; // lose 10 XP
    } else {
      // Toggle on
      history.push(targetDate);
      xpGained = 10; // gain 10 XP
    }

    habit.completionHistory = history.sort();
    
    const oldStreak = habit.streak;
    const newStreak = calculateStreak(habit.completionHistory);
    habit.streak = newStreak;
    habit.lastCompleted = habit.completionHistory[habit.completionHistory.length - 1] || '';

    await habit.save();

    // Gamification adjustments
    req.user.xp = Math.max(0, req.user.xp + xpGained);

    // If streak increased and hit a milestone, check badges
    if (newStreak > oldStreak) {
      const totalHabits = await Habit.countDocuments({ userId: req.user._id });
      const awarded = checkAndAwardBadges(req.user, newStreak, totalHabits);
      
      if (awarded.length > 0) {
        req.user.badges.push(...awarded);
        req.user.xp += awarded.length * 50; // +50 XP per badge
        badgeUnlocked = awarded;
      }
    }

    await req.user.save();

    res.json({
      habit,
      xp: req.user.xp,
      badges: req.user.badges,
      xpGained,
      badgeUnlocked
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error checking in habit.', details: err.message });
  }
});

// @route   DELETE /api/habits/:id
// @desc    Delete a habit
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found or unauthorized.' });
    }
    res.json({ success: true, message: 'Habit deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting habit.' });
  }
});

export default router;
