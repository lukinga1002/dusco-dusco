import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.adminLogin(username, password);
      localStorage.setItem('dusco_admin_token', data.token);
      navigate('/admin');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-3xl font-black text-dusco">dusco</span>
          <p className="text-gray-500 text-sm mt-1">Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-dark-soft rounded-2xl p-6 border border-gray-700 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-600 text-sm bg-dark text-white placeholder-gray-600 focus:border-dusco" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password"
              className="w-full px-4 py-3 rounded-xl border border-gray-600 text-sm bg-dark text-white placeholder-gray-600 focus:border-dusco" required />
          </div>
          {error && <p className="text-error text-xs text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-dusco text-white font-bold rounded-xl hover:bg-dusco-dark transition disabled:opacity-50">
            {loading ? 'Authenticating...' : 'Enter Admin Panel'}
          </button>
        </form>
        <p className="text-center text-xs text-gray-600 mt-4">Demo: <span className="font-mono text-gray-500">admin</span> / <span className="font-mono text-gray-500">dusco2024</span></p>
      </div>
    </div>
  );
}
