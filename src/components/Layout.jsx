import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout({ children }) {
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
