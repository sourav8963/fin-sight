import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../data/mockData';

const PORTFOLIO_COLORS = ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc'];

export default function InvestmentTracker() {
  const assets = useStore((s) => s.assets);
  const addAsset = useStore((s) => s.addAsset);
  const updateAsset = useStore((s) => s.updateAsset);
  const deleteAsset = useStore((s) => s.deleteAsset);
  const transactions = useStore((s) => s.transactions);
  const currency = useStore((s) => s.currency);
  const currentUser = useStore((s) => s.currentUser);
  const darkMode = useStore((s) => s.darkMode);

  // New investment form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Stock'); // Stock, Mutual Fund, Gold, FD, PPF, Crypto
  const [amount, setAmount] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit holding amount
  const [editingId, setEditingId] = useState(null);
  const [editingAmt, setEditingAmt] = useState('');

  // Filter holdings (only Investment categories)
  const holdings = useMemo(() => {
    return assets.filter(
      (a) => a.userId === (currentUser?.id || 'usr-1') && 
      (a.category === 'Investment' || ['Stock', 'Mutual Fund', 'Gold', 'FD', 'PPF', 'Crypto'].includes(a.category))
    );
  }, [assets, currentUser]);

  // Available cash balance (Income - Expenses)
  const cashBalance = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const expenses = transactions.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    return income - expenses;
  }, [transactions]);

  // Sum total value of investments
  const totalValue = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.amount, 0);
  }, [holdings]);

  // Calculate capital invested (expense transactions in category 'Investment')
  const investedCapital = useMemo(() => {
    return transactions
      .filter((t) => t.category === 'Investment' && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Calculate overall ROI
  const roiStats = useMemo(() => {
    const gain = totalValue - investedCapital;
    const percentage = investedCapital > 0 ? (gain / investedCapital) * 100 : 0;
    return { gain, percentage };
  }, [totalValue, investedCapital]);

  // Allocation distribution
  const allocationData = useMemo(() => {
    const classes = {};
    holdings.forEach((h) => {
      // Use asset name/category as classification
      const cls = h.name || 'Other';
      classes[cls] = (classes[cls] || 0) + h.amount;
    });
    return Object.entries(classes)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [holdings]);

  const handleAddHolding = (e) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;

    // Save as 'Investment' category but we tag name/sub-type
    addAsset(name.trim(), 'Investment', Number(amount));
    setName('');
    setAmount('');
    setShowAddForm(false);
  };

  const handleUpdateAmt = (id) => {
    if (!editingAmt || isNaN(Number(editingAmt))) return;
    updateAsset(id, Number(editingAmt));
    setEditingId(null);
    setEditingAmt('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 fade-in select-none">
      {/* Portfolio overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-surface border border-theme rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">Portfolio Value</p>
          <p className="text-xl font-extrabold text-theme mt-1.5 mono">
            {formatCurrency(totalValue, currency)}
          </p>
        </div>
        <div className="bg-surface border border-theme rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">Invested Capital</p>
          <p className="text-xl font-extrabold text-theme mt-1.5 mono">
            {formatCurrency(investedCapital, currency)}
          </p>
        </div>
        <div className="bg-surface border border-theme rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">Total Gains/Losses</p>
          <p className={`text-xl font-extrabold mt-1.5 mono ${roiStats.gain >= 0 ? 'text-income' : 'text-expense'}`}>
            {roiStats.gain >= 0 ? '+' : ''}{formatCurrency(roiStats.gain, currency)}
          </p>
        </div>
        <div className="bg-surface border border-theme rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">Portfolio ROI</p>
          <p className={`text-xl font-extrabold mt-1.5 mono ${roiStats.percentage >= 0 ? 'text-income' : 'text-expense'}`}>
            {roiStats.percentage >= 0 ? '+' : ''}{roiStats.percentage.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings list */}
        <div className="lg:col-span-2 bg-surface border border-theme rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-semibold text-theme">Investment Holdings</h2>
              <p className="text-xs text-muted mt-0.5">Track Stocks, Mutual Funds, Gold, Crypto, or Fixed Deposits</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
              style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
            >
              {showAddForm ? 'Cancel' : '➕ Add Holding'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddHolding} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface-2 p-4 border border-theme rounded-xl slide-up">
              <div>
                <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Holding Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apple Stock (AAPL), Gold Bar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-theme text-xs bg-surface text-theme placeholder:text-muted outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Current Value</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-theme text-xs bg-surface text-theme placeholder:text-muted outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                  style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
                >
                  Save Holding
                </button>
              </div>
            </form>
          )}

          {holdings.length === 0 ? (
            <p className="text-xs text-muted text-center py-8">No investment holdings registered. Add one to see portfolio summaries.</p>
          ) : (
            <div className="divide-y divide-theme">
              {holdings.map((h) => {
                const isEditing = editingId === h._id;
                return (
                  <div key={h._id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-theme truncate">{h.name}</p>
                      <p className="text-[10px] text-muted mt-0.5">Asset Class: Investment · Updated: {h.lastUpdated}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editingAmt}
                            onChange={(e) => setEditingAmt(e.target.value)}
                            className="w-24 px-2 py-1 rounded border border-theme text-xs bg-surface text-right"
                            autoFocus
                          />
                        ) : (
                          <p className="text-xs font-bold text-theme mono">{formatCurrency(h.amount, currency)}</p>
                        )}
                      </div>

                      <div className="flex gap-1.5">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleUpdateAmt(h._id)}
                              className="px-2 py-1 bg-income text-income text-[10px] rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setEditingAmt(''); }}
                              className="px-2 py-1 border border-theme text-[10px] text-muted rounded"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => { setEditingId(h._id); setEditingAmt(h.amount); }}
                              className="p-1 text-xs border border-theme text-muted hover:text-theme rounded"
                              title="Edit Value"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => deleteAsset(h._id)}
                              className="p-1 text-xs border border-theme text-muted hover:text-expense hover:border-expense rounded"
                              title="Delete"
                            >
                              🗑
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Allocation chart */}
        <div className="bg-surface border border-theme rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-theme tracking-tight mb-0.5">Asset Classification</h2>
            <p className="text-xs text-muted mb-4">Allocation by specific holdings</p>
          </div>

          {allocationData.length === 0 ? (
            <p className="text-xs text-muted py-6 text-center">No investments registered</p>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={145}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={45}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {allocationData.map((_, i) => (
                      <Cell key={i} fill={PORTFOLIO_COLORS[i % PORTFOLIO_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v, currency)} contentStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-1.5 mt-3 max-h-36 overflow-y-auto">
                {allocationData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: PORTFOLIO_COLORS[i % PORTFOLIO_COLORS.length] }} />
                      <span className="text-muted truncate">{d.name}</span>
                    </div>
                    <span className="mono text-theme font-semibold shrink-0">{formatCurrency(d.value, currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
