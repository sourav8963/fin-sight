import { useMemo, useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Sector,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useStore } from '../store/useStore';
import { getMonthlyData, getCategoryData, formatCurrency } from '../data/mockData';
import SummaryCard from '../components/SummaryCard';

const CATEGORY_COLORS = [
  '#c1440e', '#e07a5f', '#f4a261', '#e9c46a',
  '#2d6a4f', '#52b788', '#74c69d', '#95d5b2',
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-theme rounded-lg px-3 py-2.5 shadow-lg text-xs">
      <p className="text-muted mb-1.5 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-theme mono">{formatCurrency(p.value)}</span>
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
    fill, payload, value,
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
        {formatCurrency(value)}
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
  const transactions = useStore((s) => s.transactions);
  const darkMode = useStore((s) => s.darkMode);
  const [activePieIndex, setActivePieIndex] = useState(null);

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

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Monthly balance trend — takes 3 cols */}
        <div className="lg:col-span-3 bg-surface border border-theme rounded-xl p-5 slide-up stagger-4">
          <div className="flex items-center justify-between mb-5">
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
            <AreaChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
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
              <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
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
                innerRadius={38}
                outerRadius={58}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
                activeIndex={activePieIndex}
                activeShape={renderActiveShape}
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
                <span className="mono text-theme">{formatCurrency(d.value)}</span>
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
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-theme tracking-tight">Monthly Comparison</h2>
            <p className="text-xs text-muted mt-0.5">Income vs expenses per month</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barGap={4}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={<GlassCursor darkMode={darkMode} />} />
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
                    {tx.type === 'income' ? '↑' : '↓'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-theme truncate">{tx.note}</p>
                    <p className="text-[10px] text-muted">{tx.category} · {tx.date}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold mono shrink-0 ml-2
                  ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
