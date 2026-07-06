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
    profile: <Profile />,
    admin: role === 'admin' ? <AdminPanel /> : <Dashboard />,
  };

  return (
    <>
      <Layout>
        {pages[activePage] || <Dashboard />}
      </Layout>
      <TransactionModal />
    </>
  );
}

