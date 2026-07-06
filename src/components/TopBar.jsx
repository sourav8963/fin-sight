import { useStore } from '../store/useStore';

export default function TopBar() {
  const role = useStore((s) => s.role);
  const currentUser = useStore((s) => s.currentUser);
  const darkMode = useStore((s) => s.darkMode);
  const toggleDarkMode = useStore((s) => s.toggleDarkMode);
  const activePage = useStore((s) => s.activePage);
  const openModal = useStore((s) => s.openModal);
  const currency = useStore((s) => s.currency);
  const setCurrency = useStore((s) => s.setCurrency);

  const pageLabels = {
    dashboard: 'Financial Overview',
    transactions: 'Expense Tracker',
    insights: 'Analytics & Observations',
    habits: 'Financial Habit Builder',
    goals: 'Savings Goals Tracker',
    wealth: 'Wealth Growth & Net Worth',
    admin: 'Administrative Dashboard',
    profile: 'Profile & Settings',
  };

  const currencies = ['INR', 'USD', 'EUR', 'JPY', 'CNY'];

  return (
    <header
      className="sticky top-0 z-30 border-b border-theme flex items-center gap-3 px-4 md:px-6 h-14"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      {/* Page title — offset on mobile for hamburger */}
      <div className="flex-1 flex items-center ml-10 lg:ml-0 gap-2 min-w-0">
        <h1 className="font-semibold text-sm text-theme tracking-tight truncate">
          {pageLabels[activePage] || 'Overview'}
        </h1>
        {currentUser && (
          <span className="hidden sm:inline text-[10px] bg-surface-2 border border-theme text-muted px-2 py-0.5 rounded-full mono font-medium">
            {role === 'admin' ? '🛡️ Admin Account' : '👤 Standard'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* User Greeting (Desktop) */}
        {currentUser && (
          <span className="hidden md:inline text-xs text-muted font-medium mr-1 select-none">
            Hello, <span className="text-theme font-bold">{currentUser.name.split(' ')[0]}</span>
          </span>
        )}

        {/* Currency switcher */}
        <div className="relative flex items-center">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="text-xs font-semibold uppercase tracking-wider rounded-lg border border-theme py-1.5 pl-2.5 pr-6 cursor-pointer outline-none transition-all appearance-none"
            style={{ backgroundColor: 'var(--surface-2)', color: 'var(--theme)' }}
          >
            {currencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="absolute right-2 pointer-events-none" style={{ color: 'var(--theme)' }}>
            <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2.5 3.5L5 6L7.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Add transaction — admin only */}
        {role === 'admin' && (
          <button
            onClick={() => openModal('add')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
          >
            <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Add
          </button>
        )}

        {/* Dark mode */}
        <button
          onClick={toggleDarkMode}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-theme text-muted hover:text-theme transition-colors"
          style={{ backgroundColor: 'var(--surface-2)' }}
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.64 2.64l1.06 1.06M10.3 10.3l1.06 1.06M2.64 11.36l1.06-1.06M10.3 3.7l1.06-1.06"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M12 8.5A6 6 0 0 1 5.5 2a5.5 5.5 0 1 0 6.5 6.5z"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}

