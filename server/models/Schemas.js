import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  targetSavingsRate: { type: Number, default: 20 },
  budgetLimits: { type: Map, of: Number, default: {} },
  role: { type: String, enum: ['viewer', 'admin'], default: 'viewer' },
  status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
  avatar: { type: String, default: '' },
  xp: { type: Number, default: 0 },
  badges: { type: [String], default: [] },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String, default: '' },
  resetPasswordToken: { type: String, default: '' },
  resetPasswordExpires: { type: Date },
  joinedDate: { type: String, default: () => new Date().toISOString().slice(0, 10) }
});

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true }, // yyyy-MM-dd
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  note: { type: String, required: true },
  recurring: { type: Boolean, default: false },
  recurringPeriod: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' }
});

const HabitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  streak: { type: Number, default: 0 },
  lastCompleted: { type: String, default: '' },
  completionHistory: { type: [String], default: [] } // array of yyyy-MM-dd
});

const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  targetDate: { type: String, required: true }, // yyyy-MM-dd
  category: { type: String, required: true },
  contributions: [
    {
      amount: { type: Number, required: true },
      date: { type: String, required: true },
      note: { type: String, default: 'Goal contribution' }
    }
  ]
});

const AssetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['Cash', 'Investment', 'Property', 'Gold', 'Liabilities'], required: true },
  amount: { type: Number, required: true },
  lastUpdated: { type: String, default: () => new Date().toISOString().slice(0, 10) }
});

const FeedbackSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  type: { type: String, enum: ['suggestion', 'bug', 'complaint'], required: true },
  message: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  reply: { type: String, default: '' }
});

export const User = mongoose.model('User', UserSchema);
export const Transaction = mongoose.model('Transaction', TransactionSchema);
export const Habit = mongoose.model('Habit', HabitSchema);
export const Goal = mongoose.model('Goal', GoalSchema);
export const Asset = mongoose.model('Asset', AssetSchema);
export const Feedback = mongoose.model('Feedback', FeedbackSchema);
