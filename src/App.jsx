import { useEffect } from 'react';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Insights from './pages/Insights';
import TransactionModal from './components/TransactionModal';

export default function App() {
  const activePage = useStore((s) => s.activePage);
  const darkMode = useStore((s) => s.darkMode);

  // Apply dark mode class on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const pages = {
    dashboard: <Dashboard />,
    transactions: <Transactions />,
    insights: <Insights />,
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
