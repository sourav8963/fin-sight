import { subDays, format } from 'date-fns';

export const CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Rent', 'Food',
  'Transport', 'Utilities', 'Health', 'Entertainment', 'Shopping', 'Other',
];

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Other'];
export const EXPENSE_CATEGORIES = ['Rent', 'Food', 'Transport', 'Utilities', 'Health', 'Entertainment', 'Shopping', 'Other'];

const seed = [
  // Month 0 (current)
  { daysAgo: 2,  amount: 4800, category: 'Salary',        type: 'income',  note: 'Monthly salary' },
  { daysAgo: 3,  amount: 1200, category: 'Rent',          type: 'expense', note: 'Apartment rent' },
  { daysAgo: 5,  amount: 320,  category: 'Food',          type: 'expense', note: 'Grocery shopping' },
  { daysAgo: 6,  amount: 85,   category: 'Transport',     type: 'expense', note: 'Monthly transit pass' },
  { daysAgo: 7,  amount: 650,  category: 'Freelance',     type: 'income',  note: 'Logo design project' },
  { daysAgo: 9,  amount: 240,  category: 'Entertainment', type: 'expense', note: 'Streaming + gaming' },
  { daysAgo: 10, amount: 180,  category: 'Shopping',      type: 'expense', note: 'Clothing' },
  { daysAgo: 12, amount: 95,   category: 'Utilities',     type: 'expense', note: 'Electricity bill' },
  { daysAgo: 14, amount: 550,  category: 'Investment',    type: 'income',  note: 'Dividend payment' },
  { daysAgo: 15, amount: 65,   category: 'Health',        type: 'expense', note: 'Pharmacy' },

  // Month 1
  { daysAgo: 32, amount: 4800, category: 'Salary',        type: 'income',  note: 'Monthly salary' },
  { daysAgo: 33, amount: 1200, category: 'Rent',          type: 'expense', note: 'Apartment rent' },
  { daysAgo: 35, amount: 290,  category: 'Food',          type: 'expense', note: 'Grocery shopping' },
  { daysAgo: 37, amount: 85,   category: 'Transport',     type: 'expense', note: 'Monthly transit pass' },
  { daysAgo: 38, amount: 420,  category: 'Freelance',     type: 'income',  note: 'Web dev project' },
  { daysAgo: 40, amount: 120,  category: 'Entertainment', type: 'expense', note: 'Concert tickets' },
  { daysAgo: 42, amount: 340,  category: 'Shopping',      type: 'expense', note: 'Electronics' },
  { daysAgo: 44, amount: 88,   category: 'Utilities',     type: 'expense', note: 'Internet + gas' },
  { daysAgo: 46, amount: 380,  category: 'Investment',    type: 'income',  note: 'ETF returns' },
  { daysAgo: 48, amount: 150,  category: 'Health',        type: 'expense', note: 'Gym membership' },

  // Month 2
  { daysAgo: 62, amount: 4800, category: 'Salary',        type: 'income',  note: 'Monthly salary' },
  { daysAgo: 63, amount: 1200, category: 'Rent',          type: 'expense', note: 'Apartment rent' },
  { daysAgo: 65, amount: 410,  category: 'Food',          type: 'expense', note: 'Grocery shopping' },
  { daysAgo: 67, amount: 85,   category: 'Transport',     type: 'expense', note: 'Monthly transit pass' },
  { daysAgo: 68, amount: 800,  category: 'Freelance',     type: 'income',  note: 'Branding project' },
  { daysAgo: 70, amount: 200,  category: 'Entertainment', type: 'expense', note: 'Movies + dining' },
  { daysAgo: 72, amount: 115,  category: 'Shopping',      type: 'expense', note: 'Books + supplies' },
  { daysAgo: 74, amount: 92,   category: 'Utilities',     type: 'expense', note: 'Water bill' },
  { daysAgo: 76, amount: 600,  category: 'Investment',    type: 'income',  note: 'Stock sale' },
  { daysAgo: 78, amount: 280,  category: 'Health',        type: 'expense', note: 'Doctor visit' },

  // Month 3
  { daysAgo: 92,  amount: 4800, category: 'Salary',        type: 'income',  note: 'Monthly salary' },
  { daysAgo: 93,  amount: 1200, category: 'Rent',          type: 'expense', note: 'Apartment rent' },
  { daysAgo: 95,  amount: 360,  category: 'Food',          type: 'expense', note: 'Grocery shopping' },
  { daysAgo: 97,  amount: 85,   category: 'Transport',     type: 'expense', note: 'Monthly transit pass' },
  { daysAgo: 98,  amount: 950,  category: 'Freelance',     type: 'income',  note: 'Mobile app UI' },
  { daysAgo: 100, amount: 80,   category: 'Entertainment', type: 'expense', note: 'Streaming services' },
  { daysAgo: 102, amount: 620,  category: 'Shopping',      type: 'expense', note: 'Furniture' },
  { daysAgo: 104, amount: 78,   category: 'Utilities',     type: 'expense', note: 'Phone bill' },
  { daysAgo: 106, amount: 420,  category: 'Investment',    type: 'income',  note: 'Dividend' },
  { daysAgo: 108, amount: 95,   category: 'Health',        type: 'expense', note: 'Supplements' },

  // Month 4
  { daysAgo: 122, amount: 4800, category: 'Salary',        type: 'income',  note: 'Monthly salary' },
  { daysAgo: 123, amount: 1200, category: 'Rent',          type: 'expense', note: 'Apartment rent' },
  { daysAgo: 125, amount: 280,  category: 'Food',          type: 'expense', note: 'Grocery shopping' },
  { daysAgo: 127, amount: 85,   category: 'Transport',     type: 'expense', note: 'Monthly transit pass' },
  { daysAgo: 128, amount: 1100, category: 'Freelance',     type: 'income',  note: 'Dashboard project' },
  { daysAgo: 130, amount: 160,  category: 'Entertainment', type: 'expense', note: 'Sports event' },
  { daysAgo: 132, amount: 200,  category: 'Shopping',      type: 'expense', note: 'Online shopping' },
  { daysAgo: 134, amount: 110,  category: 'Utilities',     type: 'expense', note: 'Utilities bundle' },
  { daysAgo: 136, amount: 480,  category: 'Investment',    type: 'income',  note: 'Crypto gains' },
  { daysAgo: 138, amount: 55,   category: 'Health',        type: 'expense', note: 'First aid kit' },

  // Month 5
  { daysAgo: 152, amount: 4800, category: 'Salary',        type: 'income',  note: 'Monthly salary' },
  { daysAgo: 153, amount: 1200, category: 'Rent',          type: 'expense', note: 'Apartment rent' },
  { daysAgo: 155, amount: 450,  category: 'Food',          type: 'expense', note: 'Grocery shopping' },
  { daysAgo: 157, amount: 85,   category: 'Transport',     type: 'expense', note: 'Monthly transit pass' },
  { daysAgo: 158, amount: 750,  category: 'Freelance',     type: 'income',  note: 'Content strategy' },
  { daysAgo: 160, amount: 310,  category: 'Entertainment', type: 'expense', note: 'Vacation fun' },
  { daysAgo: 162, amount: 890,  category: 'Shopping',      type: 'expense', note: 'Back to school' },
  { daysAgo: 164, amount: 98,   category: 'Utilities',     type: 'expense', note: 'Electric + water' },
  { daysAgo: 166, amount: 320,  category: 'Investment',    type: 'income',  note: 'Portfolio return' },
  { daysAgo: 168, amount: 200,  category: 'Health',        type: 'expense', note: 'Dental checkup' },
];

export const mockTransactions = seed.map((item, i) => ({
  id: `tx-${i + 1}`,
  date: format(subDays(new Date(), item.daysAgo), 'yyyy-MM-dd'),
  amount: item.amount,
  category: item.category,
  type: item.type,
  note: item.note,
}));

// Mock users
export const mockUsers = [
  {
    id: 'usr-1',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    password: 'password123',
    targetSavingsRate: 25,
    role: 'viewer',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    joinedDate: '2026-01-15',
  },
  {
    id: 'usr-2',
    name: 'Sarah Chen',
    email: 'admin@example.com',
    password: 'adminpassword',
    targetSavingsRate: 35,
    role: 'admin',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    joinedDate: '2026-02-10',
  },
];

// Mock habits
export const mockHabits = [
  {
    id: 'hab-1',
    userId: 'usr-1',
    name: 'Save Daily ($10)',
    frequency: 'daily',
    streak: 5,
    lastCompleted: format(subDays(new Date(), 0), 'yyyy-MM-dd'),
    completionHistory: [
      format(subDays(new Date(), 0), 'yyyy-MM-dd'),
      format(subDays(new Date(), 1), 'yyyy-MM-dd'),
      format(subDays(new Date(), 2), 'yyyy-MM-dd'),
      format(subDays(new Date(), 3), 'yyyy-MM-dd'),
      format(subDays(new Date(), 4), 'yyyy-MM-dd'),
    ],
  },
  {
    id: 'hab-2',
    userId: 'usr-1',
    name: 'Log Daily Expenses',
    frequency: 'daily',
    streak: 12,
    lastCompleted: format(subDays(new Date(), 0), 'yyyy-MM-dd'),
    completionHistory: Array.from({ length: 12 }, (_, idx) => format(subDays(new Date(), idx), 'yyyy-MM-dd')),
  },
  {
    id: 'hab-3',
    userId: 'usr-1',
    name: 'Invest Monthly',
    frequency: 'monthly',
    streak: 3,
    lastCompleted: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    completionHistory: [
      format(subDays(new Date(), 5), 'yyyy-MM-dd'),
      format(subDays(new Date(), 35), 'yyyy-MM-dd'),
      format(subDays(new Date(), 65), 'yyyy-MM-dd'),
    ],
  },
];

// Mock savings goals
export const mockGoals = [
  {
    id: 'goal-1',
    userId: 'usr-1',
    name: 'Emergency Fund',
    targetAmount: 12000,
    currentAmount: 4500,
    targetDate: '2026-12-31',
    category: 'Emergency',
    contributions: [
      { id: 'c-1', amount: 1500, date: format(subDays(new Date(), 40), 'yyyy-MM-dd'), note: 'Tax refund contribution' },
      { id: 'c-2', amount: 1500, date: format(subDays(new Date(), 20), 'yyyy-MM-dd'), note: 'Monthly savings surplus' },
      { id: 'c-3', amount: 1500, date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), note: 'Freelance savings' },
    ],
  },
  {
    id: 'goal-2',
    userId: 'usr-1',
    name: 'Japan Vacation',
    targetAmount: 5000,
    currentAmount: 2200,
    targetDate: '2027-04-30',
    category: 'Travel',
    contributions: [
      { id: 'c-4', amount: 1000, date: format(subDays(new Date(), 30), 'yyyy-MM-dd'), note: 'Initial savings' },
      { id: 'c-5', amount: 1200, date: format(subDays(new Date(), 10), 'yyyy-MM-dd'), note: 'Bonus contribution' },
    ],
  },
];

// Mock assets/investments for wealth tracking
export const mockAssets = [
  { id: 'ast-1', userId: 'usr-1', name: 'High-Yield Savings', category: 'Cash', amount: 8200, lastUpdated: format(new Date(), 'yyyy-MM-dd') },
  { id: 'ast-2', userId: 'usr-1', name: 'Brokerage ETF (VOO)', category: 'Investment', amount: 14500, lastUpdated: format(new Date(), 'yyyy-MM-dd') },
  { id: 'ast-3', userId: 'usr-1', name: 'Crypto (BTC + ETH)', category: 'Investment', amount: 3800, lastUpdated: format(new Date(), 'yyyy-MM-dd') },
  { id: 'ast-4', userId: 'usr-1', name: 'Student Loan Liability', category: 'Liabilities', amount: 5000, lastUpdated: format(new Date(), 'yyyy-MM-dd') },
];

// Mock net worth history
export const mockNetWorthHistory = [
  { month: 'Jan', netWorth: 14500, assets: 19500, liabilities: 5000 },
  { month: 'Feb', netWorth: 16100, assets: 21100, liabilities: 5000 },
  { month: 'Mar', netWorth: 18200, assets: 23200, liabilities: 5000 },
  { month: 'Apr', netWorth: 20100, assets: 25100, liabilities: 5000 },
  { month: 'May', netWorth: 20600, assets: 25600, liabilities: 5000 },
  { month: 'Jun', netWorth: 21500, assets: 26500, liabilities: 5000 },
];

// Mock feedback complaints
export const mockFeedback = [
  {
    id: 'fb-1',
    userId: 'usr-1',
    userName: 'Alex Rivera',
    type: 'suggestion',
    message: 'It would be great to see automated bank sync in Phase 2.',
    date: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
    status: 'pending',
    reply: '',
  },
  {
    id: 'fb-2',
    userId: 'usr-1',
    userName: 'Alex Rivera',
    type: 'complaint',
    message: 'The chart details were slightly laggy on my older mobile device.',
    date: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    status: 'resolved',
    reply: 'Thank you Alex! We have optimized the Recharts rendering to use pure CSS transition transforms.',
  },
];

// Helpers
export function getMonthlyData(transactions) {
  const months = {};
  transactions.forEach((t) => {
    const m = t.date.slice(0, 7); // yyyy-MM
    if (!months[m]) months[m] = { month: m, income: 0, expenses: 0 };
    if (t.type === 'income') months[m].income += t.amount;
    else months[m].expenses += t.amount;
  });
  return Object.values(months)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({ ...m, balance: m.income - m.expenses, label: formatMonthLabel(m.month) }));
}

export function getCategoryData(transactions) {
  const cats = {};
  transactions.filter((t) => t.type === 'expense').forEach((t) => {
    cats[t.category] = (cats[t.category] || 0) + t.amount;
  });
  return Object.entries(cats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function formatMonthLabel(ym) {
  const [y, m] = ym.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m) - 1]} '${y.slice(2)}`;
}

export const CURRENCIES = {
  USD: { rate: 1, locale: 'en-US', symbol: 'USD', char: '$' },
  INR: { rate: 83.2, locale: 'en-IN', symbol: 'INR', char: '₹' },
  EUR: { rate: 0.92, locale: 'de-DE', symbol: 'EUR', char: '€' },
  JPY: { rate: 151.5, locale: 'ja-JP', symbol: 'JPY', char: '¥' },
  CNY: { rate: 7.23, locale: 'zh-CN', symbol: 'CNY', char: '¥' },
};

export function formatCurrency(n, currencyCode = 'INR') {
  const cur = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const converted = n * cur.rate;
  return new Intl.NumberFormat(cur.locale, {
    style: 'currency',
    currency: cur.symbol,
    maximumFractionDigits: currencyCode === 'JPY' ? 0 : 0,
  }).format(converted);
}

export function generateId() {
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

