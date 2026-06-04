import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phone, password);
      navigate('/dashboard');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      <div className="px-6 py-4">
        <Link to="/" className="text-xl font-black text-dusco">dusco</Link>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-12">
        <h1 className="text-2xl font-black text-dark mb-1">Welcome back</h1>
        <p className="text-sm text-gray-400 mb-8">Sign in to manage your bahashas</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0712345678"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-surface" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-surface" required />
          </div>
          {error && <p className="text-error text-xs text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-dusco text-white font-bold rounded-xl hover:bg-dusco-dark transition disabled:opacity-50 active:scale-[0.98]">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          New here? <Link to="/register" className="text-dusco font-semibold">Create account</Link>
        </p>

        <div className="mt-8 p-3 bg-surface rounded-xl text-center">
          <p className="text-[11px] text-gray-400">Demo: <span className="font-mono">0712345678</span> / <span className="font-mono">demo1234</span></p>
        </div>
      </div>
    </div>
  );
}
