import { useState } from 'react';
import { useStore } from '../store/useStore';

export default function Sidebar() {
  const activePage = useStore((s) => s.activePage);
  const setActivePage = useStore((s) => s.setActivePage);
  const rippleEffect = useStore((s) => s.rippleEffect);
  const toggleRippleEffect = useStore((s) => s.toggleRippleEffect);
  const currentUser = useStore((s) => s.currentUser);
  const role = useStore((s) => s.role);
  const logout = useStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 5h12M2 8h8M2 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M1 13L5 8l3 3 3-4 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'habits',
      label: 'Habit Tracker',
      icon: (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13 3l-6 6-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
    },
    {
      id: 'goals',
      label: 'Savings Goals',
      icon: (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'wealth',
      label: 'Wealth Growth',
      icon: (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M1.5 14.5h13M3.5 11.5l3-3 2.5 2 4.5-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'investments',
      label: 'Investment Tracker',
      icon: (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M6 10h4M8 6h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profile Settings',
      icon: (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 13c0-2 2-3.5 6-3.5s6 1.5 6 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  if (role === 'admin') {
    navItems.push({
      id: 'admin',
      label: 'Admin Panel',
      icon: (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
    });
  }

  const content = (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-theme">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center border border-theme bg-surface-2 shrink-0">
            <span className="text-base">💎</span>
          </div>
          <span className="font-semibold tracking-tight text-theme text-sm">FinSight</span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold tracking-widest text-muted uppercase mb-2">Menu</p>
        {navItems.map((item) => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActivePage(item.id); setMobileOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 mb-0.5
                ${active
                  ? 'text-theme bg-surface-2 border border-theme'
                  : 'text-muted hover:text-theme hover:bg-surface-2'
                }
              `}
            >
              <span className={active ? 'text-theme' : 'text-muted'}>{item.icon}</span>
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--text)' }} />
              )}
            </button>
          );
        })}
        
        <div className="mt-6 border-t border-theme pt-4">
          <p className="px-3 text-[10px] font-semibold tracking-widest text-muted uppercase mb-2">Experiments</p>
          <button
            onClick={toggleRippleEffect}
            className={`
              w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-150 mb-0.5 text-muted hover:text-theme hover:bg-surface-2
            `}
          >
            <div className="flex items-center gap-3">
              <span>✧</span>
              Ripple
            </div>
            <div className="w-7 h-4 rounded-full relative transition-colors" style={{ backgroundColor: rippleEffect ? 'var(--theme)' : 'var(--border)' }}>
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-surface shadow transition-transform ${rippleEffect ? 'translate-x-3' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Footer and User Profile */}
      <div className="px-4 py-4 border-t border-theme flex flex-col gap-3">
        {currentUser && (
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-surface-2 border border-theme">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-7 h-7 rounded-full border border-theme bg-surface object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-theme truncate">{currentUser.name}</p>
              <p className="text-[9px] text-muted truncate capitalize font-medium">{role}</p>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="text-muted hover:text-expense p-1 transition-colors rounded hover:bg-surface border border-transparent hover:border-theme shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 2H3.5A1.5 1.5 0 002 3.5v9A1.5 1.5 0 003.5 14H6M10 12l4-4-4-4M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
        <p className="text-[9px] text-muted mono px-2">v1.0.0 · FinSight</p>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-52 border-r border-theme h-screen sticky top-0"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        {content}
      </aside>

      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-8 h-8 flex items-center justify-center rounded border border-theme bg-surface"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Menu"
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 3h12M1 7h12M1 11h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="relative w-52 h-full border-r border-theme z-50 flex flex-col"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

