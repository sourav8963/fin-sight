import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout({ children }) {
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
          {children}
        </main>
      </div>
    </div>
  );
}
