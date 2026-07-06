import { useState } from 'react';
import { useStore } from '../store/useStore';

export default function Login() {
  const login = useStore((s) => s.login);
  const register = useStore((s) => s.register);
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const res = login(email, password);
    if (!res.success) {
      setError(res.error);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const res = register(name, email, password);
    if (res.success) {
      setSuccess('Account created successfully! Logging in...');
      setTimeout(() => {
        // Zustand automatically updates currentUser on registration, routing happens in App.jsx
      }, 1000);
    } else {
      setError(res.error);
    }
  };

  // Quick login helper
  const handleQuickLogin = (demoEmail, demoPassword) => {
    login(demoEmail, demoPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page p-4 select-none">
      <div className="relative w-full max-w-md bg-surface border border-theme rounded-2xl shadow-2xl p-6 sm:p-8 slide-up">
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-income/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-expense/10 rounded-full blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center border border-theme bg-surface-2 mb-3">
            <span className="text-xl">💎</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-theme">FinSight Tracker</h2>
          <p className="text-xs text-muted mt-1">Financial Habit Builder & Wealth Growth Tracker</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-expense/10 border border-expense/30 text-expense text-xs rounded-lg text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-income/10 border border-income/30 text-income text-xs rounded-lg text-center font-medium">
            ✓ {success}
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full px-3 py-2.5 rounded-lg border border-theme text-xs bg-surface-2 text-theme placeholder:text-muted outline-none focus:border-theme transition-colors"
              />
            </div>
          )}

          <div>
            <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full px-3 py-2.5 rounded-lg border border-theme text-xs bg-surface-2 text-theme placeholder:text-muted outline-none focus:border-theme transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-lg border border-theme text-xs bg-surface-2 text-theme placeholder:text-muted outline-none focus:border-theme transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 mt-2"
            style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle link */}
        <p className="text-center text-xs text-muted mt-5">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-theme font-semibold underline underline-offset-2 hover:opacity-80"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        {/* Quick Demo Logins */}
        <div className="mt-6 pt-5 border-t border-theme">
          <p className="text-[10px] font-semibold tracking-widest text-muted uppercase text-center mb-3">Quick Demo Logins</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin('alex@example.com', 'password123')}
              className="flex flex-col items-center p-2 rounded-lg border border-theme bg-surface-2 hover:border-income transition-colors"
            >
              <span className="text-xs font-bold text-theme">Alex Rivera</span>
              <span className="text-[9px] text-muted">Viewer Account</span>
            </button>
            <button
              onClick={() => handleQuickLogin('admin@example.com', 'adminpassword')}
              className="flex flex-col items-center p-2 rounded-lg border border-theme bg-surface-2 hover:border-income transition-colors"
            >
              <span className="text-xs font-bold text-theme">Sarah Chen</span>
              <span className="text-[9px] text-muted">🛡️ Admin Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
