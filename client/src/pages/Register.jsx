import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ phone: '', name: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const data = await register(form.phone, form.name, form.password);
      navigate('/verify-otp', { state: { phone: form.phone, duscoNumber: data.duscoNumber } });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      <div className="px-6 py-4">
        <Link to="/" className="text-xl font-black text-dusco">dusco</Link>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-12">
        <h1 className="text-2xl font-black text-dark mb-1">Create Account</h1>
        <p className="text-sm text-gray-400 mb-8">Start saving with Dusco envelopes</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
            <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Juma Hassan"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-surface" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone Number</label>
            <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="07XXXXXXXX"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-surface" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min 6 characters"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-surface" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirm Password</label>
            <input type="password" value={form.confirm} onChange={e => update('confirm', e.target.value)} placeholder="Re-enter password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-surface" required />
          </div>
          {error && <p className="text-error text-xs text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-dusco text-white font-bold rounded-xl hover:bg-dusco-dark transition disabled:opacity-50 active:scale-[0.98]">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account? <Link to="/login" className="text-dusco font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
