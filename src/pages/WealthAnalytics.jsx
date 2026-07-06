import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency, mockNetWorthHistory, CURRENCIES } from '../data/mockData';

const ASSET_COLORS = ['#2d6a4f', '#52b788', '#f4a261', '#e9c46a', '#c1440e'];

export default function WealthAnalytics() {
  const assets = useStore((s) => s.assets);
  const addAsset = useStore((s) => s.addAsset);
  const updateAsset = useStore((s) => s.updateAsset);
  const deleteAsset = useStore((s) => s.deleteAsset);
  const currency = useStore((s) => s.currency);
  const currentUser = useStore((s) => s.currentUser);
  const darkMode = useStore((s) => s.darkMode);

  // New asset form state
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState('Cash');
  const [assetAmount, setAssetAmount] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit asset inline state
  const [editingId, setEditingId] = useState(null);
  const [editingAmt, setEditingAmt] = useState('');

  // Filter assets for current user
  const userAssets = useMemo(() => {
    return assets.filter((a) => a.userId === (currentUser?.id || 'usr-1'));
  }, [assets, currentUser]);

  // Calculations
  const totals = useMemo(() => {
    let totalAssets = 0;
    let totalLiabilities = 0;

    userAssets.forEach((a) => {
      if (a.category === 'Liabilities') {
        totalLiabilities += a.amount;
      } else {
        totalAssets += a.amount;
      }
    });

    return {
      assets: totalAssets,
      liabilities: totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
    };
  }, [userAssets]);

  // Asset Categories distribution
  const allocationData = useMemo(() => {
    const categories = {};
    userAssets.forEach((a) => {
      categories[a.category] = (categories[a.category] || 0) + a.amount;
    });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [userAssets]);

  const handleAddAsset = (e) => {
    e.preventDefault();
    if (!assetName.trim() || !assetAmount) return;

    addAsset(assetName.trim(), assetCategory, Number(assetAmount));
    setAssetName('');
    setAssetAmount('');
    setShowAddForm(false);
  };

  const handleUpdate = (id) => {
    if (!editingAmt || isNaN(Number(editingAmt))) return;
    updateAsset(id, Number(editingAmt));
    setEditingId(null);
    setEditingAmt('');
  };

  const gridColor = darkMode ? '#2e2e2a' : '#e8e6de';
  const textColor = darkMode ? '#8a8880' : '#7a7870';

  return (
    <div className="max-w-5xl mx-auto space-y-6 fade-in select-none">
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-theme rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">Estimated Net Worth</p>
          <p className="text-2xl font-extrabold text-theme mt-1.5 mono">
            {formatCurrency(totals.netWorth, currency)}
          </p>
          <p className="text-[11px] text-muted mt-1 font-medium">Assets minus liabilities</p>
        </div>
        <div className="bg-surface border border-theme rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">Total Assets</p>
          <p className="text-2xl font-extrabold text-income mt-1.5 mono">
            {formatCurrency(totals.assets, currency)}
          </p>
          <p className="text-[11px] text-muted mt-1 font-medium">Cash, stocks, savings, property</p>
        </div>
        <div className="bg-surface border border-theme rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">Total Liabilities</p>
          <p className="text-2xl font-extrabold text-expense mt-1.5 mono">
            {formatCurrency(totals.liabilities, currency)}
          </p>
          <p className="text-[11px] text-muted mt-1 font-medium">Student loans, card debt, mortgages</p>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Net Worth Trend Chart (3 Cols) */}
        <div className="lg:col-span-3 bg-surface border border-theme rounded-xl p-5">
          <div className="mb-5 select-none">
            <h2 className="text-sm font-semibold text-theme tracking-tight">Net Worth Trend</h2>
            <p className="text-xs text-muted mt-0.5">Historical growth over the last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockNetWorthHistory} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="netWorthGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--income)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--income)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} width={45}
                tickFormatter={(v) => {
                  const rate = CURRENCIES[currency]?.rate || 1;
                  const sym = CURRENCIES[currency]?.char || '$';
                  const converted = v * rate;
                  return `${sym}${(converted / 1000).toFixed(0)}k`;
                }} />
              <Tooltip contentStyle={{ fontSize: '11px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px' }} />
              <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="var(--income)" strokeWidth={2.5}
                fill="url(#netWorthGlow)" activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Allocation Pie (2 Cols) */}
        <div className="lg:col-span-2 bg-surface border border-theme rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-theme tracking-tight mb-0.5">Asset Allocation</h2>
            <p className="text-xs text-muted mb-4">Breakdown by asset class category</p>
          </div>

          {allocationData.length === 0 ? (
            <div className="text-center py-10 flex-1 flex flex-col justify-center">
              <p className="text-muted text-xs">No assets recorded</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center">
              <ResponsiveContainer width="100%" height={130}>
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
                      <Cell key={i} fill={ASSET_COLORS[i % ASSET_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value, currency)} contentStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-1.5 mt-3 max-h-32 overflow-y-auto">
                {allocationData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: ASSET_COLORS[i % ASSET_COLORS.length] }} />
                      <span className="text-muted">{d.name}</span>
                    </div>
                    <span className="mono text-theme font-semibold">{formatCurrency(d.value, currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Asset Manager Panel */}
      <div className="bg-surface border border-theme rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold text-theme">Asset Registry & Investment Portfolio</h2>
            <p className="text-xs text-muted mt-0.5">Add, edit, or adjust holdings balances manually</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
            style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
          >
            {showAddForm ? 'Cancel' : '➕ Register Asset'}
          </button>
        </div>

        {/* Add Asset Form */}
        {showAddForm && (
          <form onSubmit={handleAddAsset} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-surface-2 border border-theme p-4 rounded-xl slide-up">
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Asset Name</label>
              <input
                type="text"
                placeholder="e.g. Vanguard Brokerage, Gold Coins"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-theme text-xs bg-surface text-theme placeholder:text-muted outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Category</label>
              <select
                value={assetCategory}
                onChange={(e) => setAssetCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-theme text-xs bg-surface text-theme outline-none cursor-pointer"
              >
                {['Cash', 'Investment', 'Property', 'Gold', 'Liabilities'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Current Balance / Value</label>
              <input
                type="number"
                placeholder="2000"
                value={assetAmount}
                onChange={(e) => setAssetAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-theme text-xs bg-surface text-theme placeholder:text-muted outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
              >
                Add Asset/Holdings
              </button>
            </div>
          </form>
        )}

        {/* Assets Table */}
        {userAssets.length === 0 ? (
          <p className="text-xs text-muted text-center py-6">No registered assets. Get started by adding one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-theme text-muted text-[10px] font-semibold uppercase tracking-wider">
                  <th className="py-2.5">Asset / liability Name</th>
                  <th>Category</th>
                  <th className="text-right">Balance</th>
                  <th className="text-right">Last Updated</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {userAssets.map((asset) => {
                  const isEditing = editingId === asset.id;
                  return (
                    <tr key={asset.id} className="hover:bg-surface-2/45 transition-colors">
                      <td className="py-3 font-semibold text-theme">{asset.name}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider
                          ${asset.category === 'Liabilities' ? 'bg-expense text-expense' : 'bg-income text-income'}`}>
                          {asset.category}
                        </span>
                      </td>
                      <td className="text-right font-bold mono">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editingAmt}
                            onChange={(e) => setEditingAmt(e.target.value)}
                            className="w-24 px-2 py-1 rounded border border-theme text-xs bg-surface text-right"
                            autoFocus
                          />
                        ) : (
                          <span className={asset.category === 'Liabilities' ? 'text-expense' : 'text-theme'}>
                            {formatCurrency(asset.amount, currency)}
                          </span>
                        )}
                      </td>
                      <td className="text-right text-muted mono">{asset.lastUpdated}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleUpdate(asset.id)}
                                className="px-2 py-1 bg-income text-income text-[10px] rounded hover:opacity-85 transition-opacity"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => { setEditingId(null); setEditingAmt(''); }}
                                className="px-2 py-1 border border-theme text-muted text-[10px] rounded hover:text-theme transition-all"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { setEditingId(asset.id); setEditingAmt(asset.amount); }}
                                className="px-2 py-1 border border-theme text-muted text-[10px] rounded hover:text-theme transition-all"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteAsset(asset.id)}
                                className="px-2 py-1 border border-theme text-muted text-[10px] hover:text-expense hover:border-expense rounded transition-all"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
