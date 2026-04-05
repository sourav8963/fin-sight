import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useStore } from '../store/useStore';
import { getMonthlyData, getCategoryData, formatCurrency } from '../data/mockData';

const CATEGORY_COLORS = [
  '#c1440e', '#e07a5f', '#f4a261', '#e9c46a',
  '#2d6a4f', '#52b788', '#74c69d', '#95d5b2',
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-theme rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="text-muted mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="mono text-theme">{formatCurrency(p.value)}</div>
      ))}
    </div>
  );
};

export default function Insights() {
  const transactions = useStore((s) => s.transactions);
  const darkMode = useStore((s) => s.darkMode);

  const monthlyData = useMemo(() => getMonthlyData(transactions), [transactions]);
  const categoryData = useMemo(() => getCategoryData(transactions), [transactions]);

  const gridColor = darkMode ? '#2e2e2a' : '#e8e6de';
  const textColor = darkMode ? '#8a8880' : '#7a7870';

  const stats = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const income = transactions.filter((t) => t.type === 'income');
    const totalExpenses = expenses.reduce((a, t) => a + t.amount, 0);
    const totalIncome = income.reduce((a, t) => a + t.amount, 0);

    // Avg monthly
    const months = new Set(transactions.map((t) => t.date.slice(0, 7))).size || 1;
    const avgMonthlyExpense = totalExpenses / months;
    const avgMonthlyIncome = totalIncome / months;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Top category
    const topCat = categoryData[0] || { name: 'N/A', value: 0 };

    // Biggest single expense
    const biggestExpense = expenses.reduce((max, t) => t.amount > (max?.amount || 0) ? t : max, null);
    const biggestIncome = income.reduce((max, t) => t.amount > (max?.amount || 0) ? t : max, null);

    // Monthly net savings trend
    const savingsTrend = monthlyData.map((m) => ({
      ...m,
      savings: m.income - m.expenses,
    }));

    // Category spend percentage
    const catWithPct = categoryData.map((c) => ({
      ...c,
      pct: totalExpenses > 0 ? (c.value / totalExpenses) * 100 : 0,
    }));

    // Income sources breakdown
    const incomeBySource = {};
    income.forEach((t) => {
      incomeBySource[t.category] = (incomeBySource[t.category] || 0) + t.amount;
    });
    const incomeSources = Object.entries(incomeBySource)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalExpenses, totalIncome, avgMonthlyExpense, avgMonthlyIncome,
      savingsRate, topCat, biggestExpense, biggestIncome, savingsTrend,
      catWithPct, incomeSources,
    };
  }, [transactions, categoryData, monthlyData]);

  return (
    <div className="max-w-5xl mx-auto space-y-5 fade-in">
      {/* Insight KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <InsightTile
          label="Savings Rate"
          value={`${stats.savingsRate.toFixed(1)}%`}
          sub="of income saved"
          good={stats.savingsRate >= 20}
        />
        <InsightTile
          label="Top Expense"
          value={stats.topCat.name}
          sub={formatCurrency(stats.topCat.value)}
          neutral
        />
        <InsightTile
          label="Avg Monthly Expense"
          value={formatCurrency(stats.avgMonthlyExpense)}
          sub="per month"
          neutral
        />
        <InsightTile
          label="Avg Monthly Income"
          value={formatCurrency(stats.avgMonthlyIncome)}
          sub="per month"
          good={true}
        />
      </div>

      {/* Net savings trend */}
      <div className="bg-surface border border-theme rounded-xl p-5">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-theme">Net Savings per Month</h2>
          <p className="text-xs text-muted mt-0.5">How much you saved or lost each month</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.savingsTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="savings" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {stats.savingsTrend.map((entry, i) => (
                <Cell key={i} fill={entry.savings >= 0 ? 'var(--income)' : 'var(--expense)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category breakdown horizontal bars */}
        <div className="bg-surface border border-theme rounded-xl p-5">
          <h2 className="text-sm font-semibold text-theme mb-1">Spending by Category</h2>
          <p className="text-xs text-muted mb-4">Share of total expenses</p>
          <div className="space-y-3">
            {stats.catWithPct.map((c, i) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-theme font-medium">{c.name}</span>
                  <span className="mono text-muted">{formatCurrency(c.value)} · {c.pct.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--surface-2)' }}>
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${c.pct}%`,
                      backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Income sources + notable transactions */}
        <div className="space-y-4">
          {/* Income sources */}
          <div className="bg-surface border border-theme rounded-xl p-5">
            <h2 className="text-sm font-semibold text-theme mb-1">Income Sources</h2>
            <p className="text-xs text-muted mb-3">Where your money comes from</p>
            <div className="space-y-2.5">
              {stats.incomeSources.map((s) => {
                const pct = stats.totalIncome > 0 ? (s.value / stats.totalIncome) * 100 : 0;
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-theme font-medium">{s.name}</span>
                      <span className="mono text-muted">{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--surface-2)' }}>
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: 'var(--income)' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notable observations */}
          <div className="bg-surface border border-theme rounded-xl p-5">
            <h2 className="text-sm font-semibold text-theme mb-3">Observations</h2>
            <div className="space-y-2.5">
              {stats.biggestExpense && (
                <ObservationRow
                  icon="⚡"
                  label="Biggest single expense"
                  value={`${stats.biggestExpense.note} — ${formatCurrency(stats.biggestExpense.amount)}`}
                  type="expense"
                />
              )}
              {stats.biggestIncome && (
                <ObservationRow
                  icon="✦"
                  label="Biggest income received"
                  value={`${stats.biggestIncome.note} — ${formatCurrency(stats.biggestIncome.amount)}`}
                  type="income"
                />
              )}
              <ObservationRow
                icon="◈"
                label="Savings health"
                value={
                  stats.savingsRate >= 20
                    ? `Great! You're saving ${stats.savingsRate.toFixed(1)}% of income`
                    : stats.savingsRate >= 10
                    ? `Moderate — ${stats.savingsRate.toFixed(1)}% saved. Aim for 20%+`
                    : `Low savings rate: ${stats.savingsRate.toFixed(1)}%. Consider reducing expenses`
                }
                type={stats.savingsRate >= 20 ? 'income' : 'expense'}
              />
              <ObservationRow
                icon="◉"
                label="Biggest expense category"
                value={`${stats.topCat.name} accounts for ${stats.catWithPct[0]?.pct.toFixed(1) ?? 0}% of spending`}
                type="neutral"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightTile({ label, value, sub, good, neutral }) {
  const accent = neutral ? 'text-theme' : good ? 'text-income' : 'text-expense';
  return (
    <div className="bg-surface border border-theme rounded-xl p-4">
      <p className="text-[10px] font-semibold tracking-widest text-muted uppercase mb-2">{label}</p>
      <p className={`text-lg font-bold mono tracking-tight ${accent}`}>{value}</p>
      <p className="text-[11px] text-muted mt-0.5">{sub}</p>
    </div>
  );
}

function ObservationRow({ icon, label, value, type }) {
  const col = type === 'income' ? 'text-income' : type === 'expense' ? 'text-expense' : 'text-muted';
  return (
    <div className="flex gap-3">
      <span className="text-base shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-[10px] font-semibold tracking-wider text-muted uppercase">{label}</p>
        <p className={`text-xs mt-0.5 ${col}`}>{value}</p>
      </div>
    </div>
  );
}
