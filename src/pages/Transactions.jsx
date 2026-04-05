import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { CATEGORIES, formatCurrency } from '../data/mockData';

export default function Transactions() {
  const transactions = useStore((s) => s.transactions);
  const filters = useStore((s) => s.filters);
  const setFilter = useStore((s) => s.setFilter);
  const resetFilters = useStore((s) => s.resetFilters);
  const role = useStore((s) => s.role);
  const openModal = useStore((s) => s.openModal);
  const deleteTransaction = useStore((s) => s.deleteTransaction);

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = useMemo(() => {
    let result = [...transactions];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          t.note.toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
      );
    }
    if (filters.type !== 'all') result = result.filter((t) => t.type === filters.type);
    if (filters.category !== 'all') result = result.filter((t) => t.category === filters.category);

    result.sort((a, b) => {
      const mul = filters.sortDir === 'asc' ? 1 : -1;
      if (filters.sortBy === 'date') return mul * a.date.localeCompare(b.date);
      return mul * (a.amount - b.amount);
    });
    return result;
  }, [transactions, filters]);

  const hasFilters = filters.search || filters.type !== 'all' || filters.category !== 'all';

  const toggleSort = (key) => {
    if (filters.sortBy === key) {
      setFilter('sortDir', filters.sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setFilter('sortBy', key);
      setFilter('sortDir', 'desc');
    }
  };

  const handleDelete = (id) => {
    if (deleteConfirm === id) {
      deleteTransaction(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const exportCSV = () => {
    const headers = ['Date,Amount,Category,Type,Note'];
    const rows = filtered.map((t) => `${t.date},${t.amount},${t.category},${t.type},"${t.note}"`);
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'transactions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 fade-in">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">
          Showing <span className="mono font-semibold text-theme">{filtered.length}</span> of{' '}
          <span className="mono font-semibold text-theme">{transactions.length}</span> transactions
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-theme text-muted hover:text-theme transition-colors"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 1v6M3 5l2.5 2.5L8 5M1.5 9.5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export
          </button>
          {role === 'admin' && (
            <button
              onClick={() => openModal('add')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              New
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-theme rounded-xl p-3 sm:p-4">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="w-full sm:flex-1 sm:min-w-48 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M8.5 8.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search transactions…"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-theme text-xs bg-surface-2 text-theme placeholder:text-muted outline-none focus:border-theme transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-1 sm:flex-initial">
            <select
              value={filters.type}
              onChange={(e) => setFilter('type', e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-lg border border-theme text-xs bg-surface-2 text-theme outline-none cursor-pointer"
            >
              <option value="all">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilter('category', e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-lg border border-theme text-xs bg-surface-2 text-theme outline-none cursor-pointer"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 rounded-lg text-xs text-muted hover:text-theme border border-theme bg-surface-2 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Mobile sort controls */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:hidden">
          <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">Sort:</span>
          {['date', 'amount'].map((key) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors
                ${filters.sortBy === key ? 'text-theme bg-surface-2 border border-theme' : 'text-muted'}`}
            >
              {key}
              {filters.sortBy === key && (
                <span className="text-[9px]">{filters.sortDir === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-surface border border-theme rounded-xl py-16 text-center">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm font-medium text-theme">No transactions found</p>
          <p className="text-xs text-muted mt-1">Try adjusting your search or filters</p>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="mt-3 text-xs text-muted hover:text-theme underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table — hidden on mobile */}
          <div className="hidden sm:block bg-surface border border-theme rounded-xl overflow-hidden">
            <div
              className="grid text-[10px] font-semibold tracking-widest text-muted uppercase px-5 py-3 border-b border-theme"
              style={{ gridTemplateColumns: role === 'admin' ? '1fr 100px 110px 80px auto' : '1fr 100px 110px 80px' }}
            >
              <span>Transaction</span>
              <button className="flex items-center gap-1 hover:text-theme transition-colors" onClick={() => toggleSort('date')}>
                Date <SortIcon active={filters.sortBy === 'date'} dir={filters.sortDir} />
              </button>
              <button className="flex items-center gap-1 hover:text-theme transition-colors text-right justify-end" onClick={() => toggleSort('amount')}>
                Amount <SortIcon active={filters.sortBy === 'amount'} dir={filters.sortDir} />
              </button>
              <span>Type</span>
              {role === 'admin' && <span className="text-right">Actions</span>}
            </div>
            <div className="divide-y divide-theme">
              {filtered.map((tx) => (
                <DesktopRow
                  key={tx.id}
                  tx={tx}
                  role={role}
                  onEdit={() => openModal('edit', tx)}
                  onDelete={() => handleDelete(tx.id)}
                  confirmDelete={deleteConfirm === tx.id}
                />
              ))}
            </div>
          </div>

          {/* Mobile cards — hidden on desktop */}
          <div className="sm:hidden space-y-2">
            {filtered.map((tx) => (
              <MobileCard
                key={tx.id}
                tx={tx}
                role={role}
                onEdit={() => openModal('edit', tx)}
                onDelete={() => handleDelete(tx.id)}
                confirmDelete={deleteConfirm === tx.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SortIcon({ active, dir }) {
  return (
    <svg width="8" height="10" viewBox="0 0 8 10" fill="none" className={active ? 'text-theme' : 'opacity-30'}>
      <path d="M4 1v8M1.5 3.5L4 1l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
        style={{ opacity: active && dir === 'asc' ? 1 : 0.4 }} />
      <path d="M1.5 6.5L4 9l2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
        style={{ opacity: active && dir === 'desc' ? 1 : 0.4 }} />
    </svg>
  );
}

function DesktopRow({ tx, role, onEdit, onDelete, confirmDelete }) {
  return (
    <div
      className="grid items-center px-5 py-3.5 hover:bg-surface-2 transition-colors"
      style={{ gridTemplateColumns: role === 'admin' ? '1fr 100px 110px 80px auto' : '1fr 100px 110px 80px' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 font-bold
          ${tx.type === 'income' ? 'bg-income text-income' : 'bg-expense text-expense'}`}>
          {tx.category.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-theme truncate">{tx.note}</p>
          <p className="text-[10px] text-muted">{tx.category}</p>
        </div>
      </div>
      <p className="text-xs text-muted mono">{tx.date}</p>
      <p className={`text-xs font-semibold mono text-right ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
        {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
      </p>
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider w-fit
        ${tx.type === 'income' ? 'bg-income text-income' : 'bg-expense text-expense'}`}>
        {tx.type}
      </span>
      {role === 'admin' && (
        <div className="flex items-center gap-1.5 justify-end">
          <button onClick={onEdit} className="px-2 py-1 text-[10px] rounded border border-theme text-muted hover:text-theme transition-colors">Edit</button>
          <button onClick={onDelete}
            className={`px-2 py-1 text-[10px] rounded border transition-colors
              ${confirmDelete ? 'border-expense bg-expense text-expense' : 'border-theme text-muted hover:text-expense hover:border-expense'}`}>
            {confirmDelete ? 'Sure?' : 'Del'}
          </button>
        </div>
      )}
    </div>
  );
}

function MobileCard({ tx, role, onEdit, onDelete, confirmDelete }) {
  return (
    <div className="bg-surface border border-theme rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        {/* Left: icon + info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs shrink-0 font-bold
            ${tx.type === 'income' ? 'bg-income text-income' : 'bg-expense text-expense'}`}>
            {tx.category.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-theme truncate">{tx.note}</p>
            <p className="text-[11px] text-muted mt-0.5">{tx.category}</p>
          </div>
        </div>

        {/* Right: amount */}
        <div className="text-right shrink-0">
          <p className={`text-sm font-bold mono ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
            {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
          </p>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider mt-0.5
            ${tx.type === 'income' ? 'bg-income text-income' : 'bg-expense text-expense'}`}>
            {tx.type}
          </span>
        </div>
      </div>

      {/* Bottom row: date + actions */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-theme">
        <p className="text-[11px] text-muted mono">{tx.date}</p>
        {role === 'admin' && (
          <div className="flex items-center gap-1.5">
            <button onClick={onEdit} className="px-2.5 py-1 text-[11px] rounded border border-theme text-muted hover:text-theme transition-colors">Edit</button>
            <button onClick={onDelete}
              className={`px-2.5 py-1 text-[11px] rounded border transition-colors
                ${confirmDelete ? 'border-expense bg-expense text-expense' : 'border-theme text-muted hover:text-expense hover:border-expense'}`}>
              {confirmDelete ? 'Sure?' : 'Delete'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}