import { useState } from 'react';
import { useStore } from '../store/useStore';

const NAV = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 5h12M2 8h8M2 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 13L5 8l3 3 3-4 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const activePage = useStore((s) => s.activePage);
  const setActivePage = useStore((s) => s.setActivePage);
  const [mobileOpen, setMobileOpen] = useState(false);

  const content = (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-theme">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
          >
            F
          </div>
          <span className="font-semibold tracking-tight text-theme text-sm">Finsight</span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-4">
        <p className="px-3 text-[10px] font-semibold tracking-widest text-muted uppercase mb-2">Menu</p>
        {NAV.map((item) => {
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
      </div>

      {/* Footer version */}
      <div className="px-6 py-4 border-t border-theme">
        <p className="text-[11px] text-muted mono">v1.0.0</p>
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
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
