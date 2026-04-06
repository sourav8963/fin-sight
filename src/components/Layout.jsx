import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

function SkeletonLoader() {
  return (
    <div className="space-y-6 fade-in p-2">
      <div className="flex justify-between items-center mb-6">
        <div className="h-4 w-48 bg-surface-2 border border-theme rounded animate-pulse"></div>
        <div className="h-4 w-16 bg-surface-2 border border-theme rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-surface-2 border border-theme rounded-xl animate-pulse"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-6">
        <div className="lg:col-span-3 h-64 bg-surface-2 border border-theme rounded-xl animate-pulse"></div>
        <div className="lg:col-span-2 h-64 bg-surface-2 border border-theme rounded-xl animate-pulse"></div>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  const isLoading = useStore((s) => s.isLoading);
  const setIsLoading = useStore((s) => s.setIsLoading);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [setIsLoading]);

  useEffect(() => {
    const handleClick = (e) => {
      const state = useStore.getState();
      if (!state.rippleEffect) return;

      const ripple = document.createElement('div');
      ripple.className = 'global-ripple';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;

      document.body.appendChild(ripple);

      // Clean up the DOM element after animation completes
      setTimeout(() => ripple.remove(), 600);
    };

    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {isLoading ? <SkeletonLoader /> : children}
        </main>
      </div>
    </div>
  );
}
