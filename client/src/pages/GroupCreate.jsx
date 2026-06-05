import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';

const PRESETS = [
  { name: 'Matukio', label: 'Events', pct: 30 },
  { name: 'Dharura', label: 'Emergencies', pct: 40 },
  { name: 'Fursa', label: 'Opportunities', pct: 30 },
];

export default function GroupCreate() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', description: '', frequency: 'weekly', sharesAmount: '', socialAmount: '' });
  const [bahashas, setBahashas] = useState(PRESETS.map(p => ({ name: p.name, percentage: p.pct })));
  const [phones, setPhones] = useState([]);
  const [phoneInput, setPhoneInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const total = bahashas.reduce((s, b) => s + b.percentage, 0);

  const addPhone = () => {
    if (phoneInput.trim() && !phones.includes(phoneInput.trim())) {
      setPhones([...phones, phoneInput.trim()]);
      setPhoneInput('');
    }
  };

  const handleCreate = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await api.createGroup({
        name: form.name, description: form.description,
        contributionFrequency: form.frequency,
        contributionSharesAmount: Number(form.sharesAmount) || 0,
        contributionSocialAmount: Number(form.socialAmount) || 0,
        bahashas, invitePhones: phones,
      });
      navigate(`/groups/${data.id}`);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 pt-4 pb-2">
        <Link to="/groups" className="text-xs text-dusco font-bold flex items-center gap-1 mb-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg> Back
        </Link>
        <h2 className="text-lg font-black text-dark">Create Group</h2>
        <div className="flex gap-1 mt-3 mb-4">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-dusco' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="px-5 pb-8">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-dark">Group Details</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Group Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Umoja VICOBA"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-surface" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What's this group about?"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-surface h-20 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Contribution Frequency</label>
              <div className="flex gap-2">
                {['weekly', 'biweekly', 'monthly'].map(f => (
                  <button key={f} onClick={() => setForm({ ...form, frequency: f })}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition ${form.frequency === f ? 'bg-dusco text-white' : 'bg-surface text-gray-500'}`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Shares/member (TZS)</label>
                <input type="number" value={form.sharesAmount} onChange={e => setForm({ ...form, sharesAmount: e.target.value })} placeholder="10000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-surface" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Social fund/member (TZS)</label>
                <input type="number" value={form.socialAmount} onChange={e => setForm({ ...form, socialAmount: e.target.value })} placeholder="5000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-surface" />
              </div>
            </div>
            <button onClick={() => form.name ? setStep(2) : setError('Group name required')}
              className="w-full py-3.5 bg-dusco text-white font-bold rounded-xl hover:bg-dusco-dark transition">Next: Set Up Bahashas</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-dark">Social Fund Bahashas</h3>
            <p className="text-xs text-gray-500">How should social fund contributions be split?</p>
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 mb-1">
              {bahashas.map((b, i) => {
                const colors = ['bg-dusco', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'];
                return b.percentage > 0 ? <div key={i} className={`${colors[i % colors.length]} transition-all`} style={{ width: `${b.percentage}%` }} /> : null;
              })}
            </div>
            <p className={`text-xs font-bold text-center ${Math.abs(total - 100) < 0.01 ? 'text-success' : 'text-error'}`}>{total}% / 100%</p>

            {bahashas.map((b, i) => (
              <div key={i} className="bg-surface rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <input value={b.name} onChange={e => setBahashas(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                    placeholder="Bahasha name" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                  {bahashas.length > 2 && (
                    <button onClick={() => setBahashas(prev => prev.filter((_, j) => j !== i))} className="text-gray-300 hover:text-error p-1">✕</button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input type="range" min="0" max="100" value={b.percentage}
                    onChange={e => setBahashas(prev => prev.map((x, j) => j === i ? { ...x, percentage: Number(e.target.value) } : x))}
                    className="flex-1 accent-dusco" />
                  <span className="text-sm font-bold w-10 text-center">{b.percentage}%</span>
                </div>
              </div>
            ))}

            {bahashas.length < 6 && (
              <button onClick={() => setBahashas([...bahashas, { name: '', percentage: 0 }])}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-xs text-gray-500 hover:border-dusco hover:text-dusco transition">+ Add Bahasha</button>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 bg-surface rounded-xl text-sm font-bold text-gray-500">Back</button>
              <button onClick={() => Math.abs(total - 100) < 0.01 ? setStep(3) : setError('Must sum to 100%')}
                className="flex-1 py-3 bg-dusco text-white font-bold rounded-xl hover:bg-dusco-dark transition disabled:opacity-40">Next: Invite Members</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-dark">Invite Members</h3>
            <p className="text-xs text-gray-500">Add members by phone number (they must have a Dusco account)</p>
            <div className="flex gap-2">
              <input value={phoneInput} onChange={e => setPhoneInput(e.target.value)} placeholder="07XXXXXXXX"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm bg-surface"
                onKeyDown={e => e.key === 'Enter' && addPhone()} />
              <button onClick={addPhone} className="px-4 py-3 bg-dusco text-white rounded-xl text-sm font-bold">Add</button>
            </div>
            {phones.length > 0 && (
              <div className="space-y-2">
                {phones.map((p, i) => (
                  <div key={i} className="flex items-center justify-between bg-surface rounded-xl px-4 py-2.5">
                    <span className="text-sm font-mono">{p}</span>
                    <button onClick={() => setPhones(phones.filter((_, j) => j !== i))} className="text-xs text-error">Remove</button>
                  </div>
                ))}
              </div>
            )}

            {error && <p className="text-error text-xs text-center">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 bg-surface rounded-xl text-sm font-bold text-gray-500">Back</button>
              <button onClick={handleCreate} disabled={loading}
                className="flex-1 py-3 bg-dusco text-white font-bold rounded-xl hover:bg-dusco-dark transition disabled:opacity-40">
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
