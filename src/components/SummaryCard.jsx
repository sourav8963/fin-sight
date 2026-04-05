import { formatCurrency } from '../data/mockData';
import { useStore } from '../store/useStore';

export default function SummaryCard({ label, value, delta, type, icon }) {
  const currency = useStore((s) => s.currency);
  const isPositive = delta >= 0;
  const colorClass =
    type === 'income' ? 'text-income' :
    type === 'expense' ? 'text-expense' :
    'text-theme';
  const bgClass =
    type === 'income' ? 'bg-income' :
    type === 'expense' ? 'bg-expense' :
    'bg-surface-2';

  return (
    <div
      className="bg-surface border border-theme rounded-xl p-5 relative overflow-hidden group hover:shadow-sm transition-shadow"
    >
      {/* Label row */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold tracking-widest text-muted uppercase">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bgClass}`}>
          <span className={`${colorClass} text-base`}>{icon}</span>
        </div>
      </div>

      {/* Value */}
      <div className={`text-2xl font-bold mono tracking-tight ${colorClass}`}>
        {formatCurrency(value, currency)}
      </div>

      {/* Delta */}
      {delta !== undefined && (
        <div className={`mt-2 text-xs flex items-center gap-1 ${isPositive ? 'text-income' : 'text-expense'}`}>
          <span>{isPositive ? '↑' : '↓'}</span>
          <span className="mono">{Math.abs(delta).toFixed(1)}%</span>
          <span className="text-muted">vs last month</span>
        </div>
      )}

      {/* Subtle accent line */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 w-full opacity-20 ${bgClass}`}
        style={{ background: type === 'income' ? 'var(--income)' : type === 'expense' ? 'var(--expense)' : 'var(--border)' }}
      />
    </div>
  );
}
