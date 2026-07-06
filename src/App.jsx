import { useEffect } from 'react';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Insights from './pages/Insights';
import TransactionModal from './components/TransactionModal';

// New Pages
import Login from './pages/Login';
import HabitTracker from './pages/HabitTracker';
import SavingsGoals from './pages/SavingsGoals';
import WealthAnalytics from './pages/WealthAnalytics';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import InvestmentTracker from './pages/InvestmentTracker';

export default function App() {
  const activePage = useStore((s) => s.activePage);
  const darkMode = useStore((s) => s.darkMode);
  const currentUser = useStore((s) => s.currentUser);
  const role = useStore((s) => s.role);

  // Apply dark mode class on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Auth gate
  if (!currentUser) {
    return <Login />;
  }

  const pages = {
    dashboard: <Dashboard />,
    transactions: <Transactions />,
    insights: <Insights />,
    habits: <HabitTracker />,
    goals: <SavingsGoals />,
    wealth: <WealthAnalytics />,
    investments: <InvestmentTracker />,
    profile: <Profile />,
    admin: role === 'admin' ? <AdminPanel /> : <Dashboard />,
  };

  const toasts = useStore((s) => s.toasts);

  return (
    <>
      <Layout>
        {pages[activePage] || <Dashboard />}
      </Layout>
      <TransactionModal />

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none select-none no-print">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-3.5 rounded-xl border text-xs font-semibold shadow-2xl pointer-events-auto flex items-center gap-2 slide-up
              ${t.type === 'error' 
                ? 'bg-expense/10 border-expense/30 text-expense' 
                : t.type === 'success' 
                ? 'bg-income/10 border-income/30 text-income' 
                : 'bg-surface border-theme text-theme'}`}
          >
            <span>{t.type === 'error' ? '⚠️' : t.type === 'success' ? '✓' : '💡'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}

