import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [waking, setWaking] = useState(false);
  const wakeTimer = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Pre-warm the backend so it's awake by the time the user submits
  useEffect(() => {
    fetch('/api/health').catch(() => {});
    return () => clearTimeout(wakeTimer.current);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    wakeTimer.current = setTimeout(() => setWaking(true), 3000);
    try {
      await login(phone, password);
      navigate('/dashboard');
    } catch (err) { setError(err.message); }
    finally {
      clearTimeout(wakeTimer.current);
      setWaking(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      <div className="px-6 py-4">
        <Link to="/" className="text-xl font-black text-dusco">dusco</Link>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-12">
        <h1 className="text-2xl font-black text-dark mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-8">Sign in to manage your bahashas</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-phone" className="block text-xs font-semibold text-gray-500 mb-1.5">Phone Number</label>
            <input id="login-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0712345678"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-surface focus-visible:ring-2 focus-visible:ring-dusco" required />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
            <input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-surface focus-visible:ring-2 focus-visible:ring-dusco" required />
          </div>
          {error && <p className="text-error text-xs text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-dusco text-white font-bold rounded-xl hover:bg-dusco-dark transition disabled:opacity-70 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
            {loading ? (waking ? 'Waking up secure servers…' : 'Signing in…') : 'Sign In'}
          </button>
          {waking && (
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-dusco animate-pulse" style={{ width: '60%' }} />
            </div>
          )}
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          New here? <Link to="/register" className="text-dusco font-semibold">Create account</Link>
        </p>

        <div className="mt-8 p-3 bg-surface rounded-xl text-center">
          <p className="text-[11px] text-gray-500">Demo: <span className="font-mono">0712345678</span> / <span className="font-mono">demo1234</span></p>
        </div>
      </div>
    </div>
  );
}
