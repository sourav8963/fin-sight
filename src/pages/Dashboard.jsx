import { useMemo, useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Sector,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useStore } from '../store/useStore';
import { getMonthlyData, getCategoryData, formatCurrency, CURRENCIES } from '../data/mockData';
import SummaryCard from '../components/SummaryCard';

const CATEGORY_COLORS = [
  '#c1440e', '#e07a5f', '#f4a261', '#e9c46a',
  '#2d6a4f', '#52b788', '#74c69d', '#95d5b2',
];

const CATEGORY_ICONS = {
  Salary: '💰',
  Freelance: '💻',
  Investment: '📈',
  Rent: '🏠',
  Food: '🍕',
  Transport: '🚌',
  Utilities: '⚡',
  Health: '💊',
  Entertainment: '🎮',
  Shopping: '🛍️',
  Other: '📦',
};

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-theme rounded-lg px-3 py-2.5 shadow-lg text-xs">
      <p className="text-muted mb-1.5 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-theme mono">{formatCurrency(p.value, currency)}</span>
          <span className="text-muted capitalize">{p.dataKey}</span>
        </div>
      ))}
    </div>
  );
};

const RADIAN = Math.PI / 180;

const renderActiveShape = (props) => {
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, value, currency
  } = props;

  const expandedOuter = outerRadius + 6;
  // Position the label at the midpoint of the slice, pushed outward
  const labelRadius = outerRadius + 22;
  const lx = cx + labelRadius * Math.cos(-midAngle * RADIAN);
  const ly = cy + labelRadius * Math.sin(-midAngle * RADIAN);

  // Determine text anchor based on which side the label is on
  const textAnchor = lx > cx ? 'start' : 'end';

  return (
    <g>
      {/* Expanded active sector */}
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={expandedOuter}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'brightness(1.15)' }}
      />
      {/* Connector line */}
      <line
        x1={cx + (outerRadius + 2) * Math.cos(-midAngle * RADIAN)}
        y1={cy + (outerRadius + 2) * Math.sin(-midAngle * RADIAN)}
        x2={lx}
        y2={ly}
        stroke={fill}
        strokeWidth={1.5}
        strokeOpacity={0.6}
      />
      {/* Category name */}
      <text
        x={lx}
        y={ly - 6}
        textAnchor={textAnchor}
        fill="var(--text)"
        fontSize={11}
        fontWeight={600}
      >
        {payload.name}
      </text>
      {/* Amount */}
      <text
        x={lx}
        y={ly + 8}
        textAnchor={textAnchor}
        fill={fill}
        fontSize={11}
        fontFamily="'JetBrains Mono', monospace"
      >
        {formatCurrency(value, currency)}
      </text>
    </g>
  );
};

const GlassCursor = ({ x, y, width, height, darkMode }) => {
  if (!width || !height) return null;
  const pad = 6;
  const rx = x - pad;
  const ry = y - 2;
  const rw = width + pad * 2;
  const rh = height + 4;
  const fillColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.45)';
  const strokeColor = darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.6)';
  const filterId = 'glass-blur';

  return (
    <g>
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
        </filter>
      </defs>
      {/* Blurred glow layer */}
      <rect
        x={rx} y={ry} width={rw} height={rh} rx={8}
        fill={fillColor}
        filter={`url(#${filterId})`}
      />
      {/* Sharp glass layer */}
      <rect
        x={rx} y={ry} width={rw} height={rh} rx={8}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1}
      />
    </g>
  );
};

export default function Dashboard() {
  const allTransactions = useStore((s) => s.transactions);
  const darkMode = useStore((s) => s.darkMode);
  const currency = useStore((s) => s.currency);
  const [activePieIndex, setActivePieIndex] = useState(null);

  const habits = useStore((s) => s.habits);
  const goals = useStore((s) => s.goals);
  const currentUser = useStore((s) => s.currentUser);
  const toggleHabitCompletion = useStore((s) => s.toggleHabitCompletion);
  const setActivePage = useStore((s) => s.setActivePage);

  // Bills and Reminders State & Actions
  const bills = useStore((s) => s.bills);
  const payBill = useStore((s) => s.payBill);
  const deleteBill = useStore((s) => s.deleteBill);
  const addBill = useStore((s) => s.addBill);

  const [showBillForm, setShowBillForm] = useState(false);
  const [billForm, setBillForm] = useState({ name: '', amount: '', dueDate: '', category: 'Utilities' });

  const handleCreateBill = async (e) => {
    e.preventDefault();
    const res = await addBill(billForm);
    if (res.success) {
      setBillForm({ name: '', amount: '', dueDate: '', category: 'Utilities' });
      setShowBillForm(false);
    }
  };

  const transactions = useMemo(() => {
    return allTransactions.filter((t) => !t.userId || t.userId === currentUser?.id);
  }, [allTransactions, currentUser]);

  const userHabits = useMemo(() => habits.filter(h => h.userId === (currentUser?.id || 'usr-1')), [habits, currentUser]);
  const userGoals = useMemo(() => goals.filter(g => g.userId === (currentUser?.id || 'usr-1')), [goals, currentUser]);

  const onPieEnter = useCallback((_, index) => {
    setActivePieIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActivePieIndex(null);
  }, []);

  const monthlyData = useMemo(() => getMonthlyData(transactions), [transactions]);
  const categoryData = useMemo(() => getCategoryData(transactions), [transactions]);

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const expenses = transactions.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  // Month-over-month deltas
  const deltas = useMemo(() => {
    if (monthlyData.length < 2) return {};
    const cur = monthlyData[monthlyData.length - 1];
    const prev = monthlyData[monthlyData.length - 2];
    return {
      income: prev.income ? ((cur.income - prev.income) / prev.income) * 100 : 0,
      expenses: prev.expenses ? ((cur.expenses - prev.expenses) / prev.expenses) * 100 : 0,
      balance: prev.balance ? ((cur.balance - prev.balance) / Math.abs(prev.balance)) * 100 : 0,
    };
  }, [monthlyData]);

  // Recent 5 transactions
  const recent = useMemo(() => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5), [transactions]);

  const gridColor = darkMode ? '#2e2e2a' : '#e8e6de';
  const textColor = darkMode ? '#8a8880' : '#7a7870';

  return (
    <div className="max-w-7xl mx-auto space-y-6 fade-in">
      {/* Date bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted mono">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <span className="text-[10px] font-semibold tracking-widest text-muted uppercase">
          All time
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="slide-up stagger-1">
          <SummaryCard
            label="Net Balance"
            value={totals.balance}
            delta={deltas.balance}
            type="balance"
            icon="⬡"
          />
        </div>
        <div className="slide-up stagger-2">
          <SummaryCard
            label="Total Income"
            value={totals.income}
            delta={deltas.income}
            type="income"
            icon="↑"
          />
        </div>
        <div className="slide-up stagger-3">
          <SummaryCard
            label="Total Expenses"
            value={totals.expenses}
            delta={deltas.expenses}
            type="expense"
            icon="↓"
          />
        </div>
      </div>

      {/* Habits & Savings Goals Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Habit Widget */}
        <div className="bg-surface border border-theme rounded-xl p-5 slide-up stagger-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-sm font-semibold text-theme tracking-tight">Active Habits</h2>
              <p className="text-xs text-muted">Toggle today's check-ins</p>
            </div>
            <button
              onClick={() => setActivePage('habits')}
              className="text-[11px] text-muted hover:text-theme transition-colors font-medium"
            >
              Manage Habits →
            </button>
          </div>
          {userHabits.length === 0 ? (
            <p className="text-xs text-muted py-4">No active habits. Create one to build discipline!</p>
          ) : (
            <div className="space-y-2.5">
              {userHabits.slice(0, 2).map((habit) => {
                const todayStr = new Date().toISOString().slice(0, 10);
                const completed = habit.completionHistory.includes(todayStr);
                return (
                  <div key={habit.id} className="flex justify-between items-center bg-surface-2 p-3 border border-theme rounded-lg text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-theme truncate">{habit.name}</p>
                      <p className="text-[10px] text-muted mt-0.5">Streak: <strong className="text-income font-bold">🔥 {habit.streak} days</strong></p>
                    </div>
                    <button
                      onClick={() => toggleHabitCompletion(habit.id, todayStr)}
                      className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs transition-all hover:scale-105
                        ${completed ? 'bg-income/10 border-income text-income' : 'bg-surface border-theme text-muted'}`}
                    >
                      {completed ? '✓' : '○'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Savings Goals Widget */}
        <div className="bg-surface border border-theme rounded-xl p-5 slide-up stagger-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-sm font-semibold text-theme tracking-tight">Savings Goals</h2>
              <p className="text-xs text-muted">Progress toward active targets</p>
            </div>
            <button
              onClick={() => setActivePage('goals')}
              className="text-[11px] text-muted hover:text-theme transition-colors font-medium"
            >
              Manage Goals →
            </button>
          </div>
          {userGoals.length === 0 ? (
            <p className="text-xs text-muted py-4">No active goals. Set a target and track savings!</p>
          ) : (
            <div className="space-y-2.5">
              {userGoals.slice(0, 2).map((goal) => {
                const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                return (
                  <div key={goal.id} className="bg-surface-2 p-3 border border-theme rounded-lg text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-theme truncate">{goal.name}</span>
                      <span className="font-semibold text-theme mono">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface border border-theme rounded-full overflow-hidden">
                      <div
                        className="h-full bg-income rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Monthly balance trend — takes 3 cols */}
        <div className="lg:col-span-3 bg-surface border border-theme rounded-xl p-5 slide-up stagger-4">
          <div className="flex items-center justify-between mb-5 select-none cursor-default">
            <div>
              <h2 className="text-sm font-semibold text-theme tracking-tight">Balance Trend</h2>
              <p className="text-xs text-muted mt-0.5">Income vs expenses over time</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--income)' }} />Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--expense)' }} />Expenses
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--income)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--income)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--expense)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="var(--expense)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} width={45}
                tickFormatter={(v) => {
                  const rate = CURRENCIES[currency]?.rate || 1;
                  const sym = CURRENCIES[currency]?.char || '$';
                  const converted = v * rate;
                  return `${sym}${(converted / 1000).toFixed(0)}k`;
                }} />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Area type="monotone" dataKey="income" stroke="var(--income)" strokeWidth={2}
                fill="url(#incomeGrad)" dot={false} activeDot={{ r: 4, fill: 'var(--income)' }} />
              <Area type="monotone" dataKey="expenses" stroke="var(--expense)" strokeWidth={2}
                fill="url(#expenseGrad)" dot={false} activeDot={{ r: 4, fill: 'var(--expense)' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Spending by category — 2 cols */}
        <div className="lg:col-span-2 bg-surface border border-theme rounded-xl p-5 slide-up stagger-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-theme tracking-tight">Spending Breakdown</h2>
            <p className="text-xs text-muted mt-0.5">By category</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
                activeIndex={activePieIndex}
                activeShape={(props) => renderActiveShape({ ...props, currency })}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto">
            {categoryData.slice(0, 6).map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                  <span className="text-muted">{d.name}</span>
                </div>
                <span className="mono text-theme">{formatCurrency(d.value, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly bar chart + Recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Monthly bar chart */}
        <div
          className="lg:col-span-3 border border-theme rounded-xl p-5"
          style={{
            backgroundColor: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div className="mb-5 select-none text-cursor-default cursor-default">
            <h2 className="text-sm font-semibold text-theme tracking-tight">Monthly Comparison</h2>
            <p className="text-xs text-muted mt-0.5">Income vs expenses per month</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={4}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} width={45}
                tickFormatter={(v) => {
                  const rate = CURRENCIES[currency]?.rate || 1;
                  const sym = CURRENCIES[currency]?.char || '$';
                  const converted = v * rate;
                  return `${sym}${(converted / 1000).toFixed(0)}k`;
                }} />
              <Tooltip content={<CustomTooltip currency={currency} />} cursor={<GlassCursor darkMode={darkMode} />} />
              <Bar dataKey="income" fill="var(--income)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expenses" fill="var(--expense)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent transactions */}
        <div className="lg:col-span-2 bg-surface border border-theme rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-theme tracking-tight">Recent Activity</h2>
            <button
              className="text-[11px] text-muted hover:text-theme transition-colors"
              onClick={() => useStore.getState().setActivePage('transactions')}
            >
              View all →
            </button>
          </div>
          <div className="space-y-0">
            {recent.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2.5 border-b border-theme last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0
                      ${tx.type === 'income' ? 'bg-income text-income' : 'bg-expense text-expense'}`}
                  >
                    {CATEGORY_ICONS[tx.category] || '📋'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-theme truncate">{tx.note}</p>
                    <p className="text-[10px] text-muted">{tx.category} · {tx.date}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold mono shrink-0 ml-2
                  ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reminders & Bills Tracker */}
      <div className="bg-surface border border-theme rounded-xl p-5 slide-up stagger-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-sm font-semibold text-theme tracking-tight">Reminders & Bill Payments</h2>
            <p className="text-xs text-muted mt-0.5">Stay on top of upcoming expenses to avoid penalties</p>
          </div>
          <button
            onClick={() => setShowBillForm(!showBillForm)}
            className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-theme hover:bg-surface-2 rounded text-theme"
          >
            {showBillForm ? 'Cancel' : '➕ Add Bill'}
          </button>
        </div>

        {/* Inline Add Bill Form */}
        {showBillForm && (
          <form onSubmit={handleCreateBill} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3.5 border border-theme bg-surface-2 rounded-xl mb-4 text-xs">
            <div>
              <label className="text-[9px] uppercase tracking-wider text-muted font-bold block mb-1">Bill Name</label>
              <input
                type="text"
                required
                value={billForm.name}
                onChange={(e) => setBillForm({ ...billForm, name: e.target.value })}
                className="w-full px-2 py-1.5 rounded border border-theme bg-surface text-theme outline-none"
                placeholder="e.g. Electricity"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider text-muted font-bold block mb-1">Amount</label>
              <input
                type="number"
                required
                min="1"
                value={billForm.amount}
                onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                className="w-full px-2 py-1.5 rounded border border-theme bg-surface text-theme outline-none"
                placeholder="e.g. 50"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider text-muted font-bold block mb-1">Due Date</label>
              <input
                type="date"
                required
                value={billForm.dueDate}
                onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                className="w-full px-2 py-1.5 rounded border border-theme bg-surface text-theme outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 bg-theme text-bg rounded font-semibold uppercase tracking-wider text-[10px]"
                style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
              >
                Create Reminder
              </button>
            </div>
          </form>
        )}

        {/* Bills list */}
        {bills.length === 0 ? (
          <p className="text-xs text-muted py-4 text-center">No upcoming bills scheduled.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {bills.map((bill) => (
              <div
                key={bill._id || bill.id}
                className={`p-3.5 border rounded-xl flex flex-col justify-between
                  ${bill.status === 'paid' 
                    ? 'border-income/20 bg-income/5 opacity-60' 
                    : 'border-theme bg-surface-2'}`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-theme text-xs">{bill.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider
                      ${bill.status === 'paid' ? 'bg-income text-income' : 'bg-expense text-expense animate-pulse'}`}>
                      {bill.status}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-theme mt-1.5 mono">
                    {formatCurrency(bill.amount, currency)}
                  </p>
                  <p className="text-[10px] text-muted mt-1">
                    Due Date: <span className="mono font-semibold">{bill.dueDate}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-2 border-t border-theme/30 no-print">
                  {bill.status === 'unpaid' && (
                    <button
                      onClick={() => payBill(bill._id || bill.id)}
                      className="flex-1 py-1 rounded text-[10px] font-bold bg-income text-white hover:opacity-90 transition-all"
                    >
                      Mark Paid
                    </button>
                  )}
                  <button
                    onClick={() => deleteBill(bill._id || bill.id)}
                    className="p-1 border border-theme text-muted hover:border-expense hover:text-expense rounded transition-all text-xs"
                    title="Delete Bill Reminder"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
