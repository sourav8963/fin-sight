import { useState } from 'react';
import { useStore } from '../store/useStore';

export default function Login() {
  const login = useStore((s) => s.login);
  const register = useStore((s) => s.register);
  const forgotPassword = useStore((s) => s.forgotPassword);
  const resetPassword = useStore((s) => s.resetPassword);

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error);
    }
  };

  const handleRegister = async (e) => {
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

    const res = await register(name, email, password);
    if (res.success) {
      setSuccess('Account created successfully! Logging in...');
    } else {
      setError(res.error);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const res = await forgotPassword(email);
    if (res.success) {
      setSuccess('Password reset token logged to backend console successfully!');
      setMode('reset');
    } else {
      setError(res.error);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token || !newPassword) {
      setError('Please fill in both the token and the new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    const res = await resetPassword(token, newPassword);
    if (res.success) {
      setSuccess('Password reset successfully! You can now log in.');
      setMode('login');
      setToken('');
      setNewPassword('');
    } else {
      setError(res.error);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setError('');
    const res = await login(demoEmail, demoPassword);
    if (!res.success) {
      setError(res.error);
    }
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

        {/* Login Mode */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block">Password</label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                  className="text-[10px] text-muted hover:text-theme underline"
                >
                  Forgot?
                </button>
              </div>
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
              Sign In
            </button>
          </form>
        )}

        {/* Register Mode */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
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
              Create Account
            </button>
          </form>
        )}

        {/* Forgot Password Mode */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter registered email"
                className="w-full px-3 py-2.5 rounded-lg border border-theme text-xs bg-surface-2 text-theme placeholder:text-muted outline-none focus:border-theme transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 mt-2"
              style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
            >
              Send Reset Token
            </button>
            <button
              type="button"
              onClick={() => { setMode('reset'); setError(''); setSuccess(''); }}
              className="w-full text-center text-xs text-muted hover:text-theme underline pt-1 block"
            >
              Have a Reset Token? Click here
            </button>
          </form>
        )}

        {/* Reset Password Mode */}
        {mode === 'reset' && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">Reset Token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token from console logs"
                className="w-full px-3 py-2.5 rounded-lg border border-theme text-xs bg-surface-2 text-theme placeholder:text-muted outline-none focus:border-theme transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-widest text-muted uppercase block mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2.5 rounded-lg border border-theme text-xs bg-surface-2 text-theme placeholder:text-muted outline-none focus:border-theme transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 mt-2"
              style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
            >
              Reset Password
            </button>
          </form>
        )}

        {/* Mode Toggles */}
        <div className="text-center text-xs text-muted mt-5">
          {mode === 'login' && (
            <p>
              Don't have an account?{' '}
              <button onClick={() => { setMode('register'); setError(''); }} className="text-theme font-semibold underline hover:opacity-85">
                Sign Up
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p>
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError(''); }} className="text-theme font-semibold underline hover:opacity-85">
                Sign In
              </button>
            </p>
          )}
          {(mode === 'forgot' || mode === 'reset') && (
            <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="text-theme font-semibold underline hover:opacity-85">
              ← Return to Login
            </button>
          )}
        </div>

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

