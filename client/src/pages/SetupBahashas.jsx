import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';

const PRESETS = [
  { name: 'Akiba', label: 'Savings' },
  { name: 'Safari', label: 'Travel' },
  { name: 'Karo', label: 'School Fees' },
  { name: 'Binafsi', label: 'Personal' },
  { name: 'Biashara', label: 'Business' },
  { name: 'Dharura', label: 'Emergency' },
];

export default function SetupBahashas() {
  const [bahashas, setBahashas] = useState([
    { name: '', percentage: 50 },
    { name: '', percentage: 50 },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();

  const total = bahashas.reduce((s, b) => s + b.percentage, 0);
  const isValid = bahashas.length >= 2 && bahashas.every(b => b.name.trim()) && Math.abs(total - 100) < 0.01;

  const update = (i, field, val) => {
    setBahashas(prev => prev.map((b, j) => j === i ? { ...b, [field]: field === 'percentage' ? Number(val) || 0 : val } : b));
  };

  const addBahasha = () => {
    if (bahashas.length >= 6) return;
    setBahashas(prev => [...prev, { name: '', percentage: 0 }]);
  };

  const removeBahasha = (i) => {
    if (bahashas.length <= 2) return;
    setBahashas(prev => prev.filter((_, j) => j !== i));
  };

  const autoBalance = () => {
    const each = Math.floor(100 / bahashas.length);
    const remainder = 100 - each * bahashas.length;
    setBahashas(prev => prev.map((b, i) => ({ ...b, percentage: each + (i === 0 ? remainder : 0) })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return setError('All bahashas need names and percentages must total 100%');
    setError('');
    setLoading(true);
    try {
      for (const b of bahashas) {
        await api.createWallet({ name: b.name, percentage: b.percentage });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
      <div className="text-center mb-6">
        <h1 className="font-heading text-2xl font-bold text-dark mb-1">Set Up Your Bahashas</h1>
        <p className="text-sm text-gray-400">Create 2-6 savings envelopes and set how deposits are split</p>
        {state?.duscoNumber && (
          <div className="mt-3 inline-block bg-dusco-light text-dusco text-xs font-heading font-semibold px-3 py-1.5 rounded-full">
            Your Dusco Number: {state.duscoNumber}
          </div>
        )}
      </div>

      {/* Percentage visualization */}
      <div className="mb-6">
        <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
          {bahashas.map((b, i) => {
            const colors = ['bg-dusco', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500'];
            return b.percentage > 0 ? (
              <div key={i} className={`${colors[i % colors.length]} transition-all duration-300`}
                style={{ width: `${b.percentage}%` }} />
            ) : null;
          })}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className={`text-xs font-medium ${Math.abs(total - 100) < 0.01 ? 'text-success' : 'text-error'}`}>
            {total}% of 100%
          </span>
          <button type="button" onClick={autoBalance} className="text-xs text-dusco font-medium">
            Auto-balance
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 flex-1">
        {bahashas.map((b, i) => {
          const colors = ['border-l-dusco', 'border-l-blue-500', 'border-l-amber-500', 'border-l-emerald-500', 'border-l-purple-500', 'border-l-pink-500'];
          return (
            <div key={i} className={`bg-gray-50 rounded-2xl p-4 border-l-4 ${colors[i % colors.length]}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-gray-400 font-medium w-5">{i + 1}.</span>
                <input type="text" value={b.name} onChange={e => update(i, 'name', e.target.value)}
                  placeholder="Envelope name" className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white" required />
                {bahashas.length > 2 && (
                  <button type="button" onClick={() => removeBahasha(i)} className="text-gray-300 hover:text-error p-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 pl-7">
                <input type="range" min="0" max="100" value={b.percentage}
                  onChange={e => update(i, 'percentage', e.target.value)}
                  className="flex-1 accent-dusco" />
                <div className="flex items-center bg-white border border-gray-200 rounded-xl px-2 w-20">
                  <input type="number" min="0" max="100" value={b.percentage}
                    onChange={e => update(i, 'percentage', e.target.value)}
                    className="w-full py-1.5 text-sm text-center border-none bg-transparent focus:outline-none" />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              </div>
              {/* Preset suggestions */}
              {!b.name && (
                <div className="flex flex-wrap gap-1.5 mt-2 pl-7">
                  {PRESETS.filter(p => !bahashas.some(x => x.name === p.name)).slice(0, 3).map(p => (
                    <button key={p.name} type="button" onClick={() => update(i, 'name', p.name)}
                      className="text-[10px] px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-500 hover:border-dusco hover:text-dusco">
                      {p.name} ({p.label})
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {bahashas.length < 6 && (
          <button type="button" onClick={addBahasha}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-dusco hover:text-dusco transition">
            + Add Envelope ({bahashas.length}/6)
          </button>
        )}

        {error && <p className="text-error text-xs text-center">{error}</p>}

        <div className="pt-4 pb-6">
          <button type="submit" disabled={!isValid || loading}
            className="w-full py-3.5 bg-dusco text-white font-heading font-semibold rounded-2xl hover:bg-dusco-dark transition disabled:opacity-40">
            {loading ? 'Setting up...' : 'Start Saving'}
          </button>
        </div>
      </form>
    </div>
  );
}
