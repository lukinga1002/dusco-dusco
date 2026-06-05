import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { formatTZS } from '../utils/format';

export default function Manage() {
  const [bahashas, setBahashas] = useState([]);
  const [editing, setEditing] = useState(null);
  const [rebalancing, setRebalancing] = useState(false);
  const [allocations, setAllocations] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPct, setNewPct] = useState(0);
  const [lockModal, setLockModal] = useState(null);
  const [lockDate, setLockDate] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [transferTo, setTransferTo] = useState('');
  const [goalModal, setGoalModal] = useState(null);
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await api.getWallets();
      setBahashas(data.bahashas);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { load(); }, []);

  const total = allocations.reduce((s, a) => s + a.percentage, 0);

  // ── Edit Name ──
  const handleEditName = async (id, name) => {
    try {
      await api.updateWallet(id, { name });
      setEditing(null);
      setMsg('Name updated');
      load();
    } catch (err) { setError(err.message); }
  };

  // ── Rebalance ──
  const startRebalance = () => {
    setAllocations(bahashas.map(b => ({ id: b.id, name: b.name, percentage: b.percentage })));
    setRebalancing(true);
    setError('');
  };

  const updateAlloc = (i, pct) => {
    setAllocations(prev => prev.map((a, j) => j === i ? { ...a, percentage: Number(pct) || 0 } : a));
  };

  const saveRebalance = async () => {
    if (Math.abs(total - 100) > 0.01) return setError('Must sum to 100%');
    try {
      await api.rebalance(allocations.map(a => ({ id: a.id, percentage: a.percentage })));
      setRebalancing(false);
      setMsg('Allocations updated');
      load();
    } catch (err) { setError(err.message); }
  };

  // ── Add bahasha ──
  const handleAdd = async () => {
    if (!newName.trim()) return setError('Name required');
    try {
      await api.createWallet({ name: newName, percentage: newPct });
      setAddMode(false);
      setNewName('');
      setNewPct(0);
      setMsg('Envelope added');
      load();
    } catch (err) { setError(err.message); }
  };

  // ── Lock / Unlock ──
  const handleLock = async () => {
    if (!lockDate) return setError('Select a lock date');
    try {
      await api.updateWallet(lockModal.id, { lockDate });
      setLockModal(null);
      setLockDate('');
      setMsg('Envelope locked');
      load();
    } catch (err) { setError(err.message); }
  };

  const handleUnlock = async (b) => {
    try {
      const data = await api.updateWallet(b.id, { unlock: true });
      setMsg(data.message);
      load();
    } catch (err) { setError(err.message); }
  };

  // ── Delete ──
  const handleDelete = async () => {
    try {
      await api.deleteWallet(deleteModal.id, { transferToId: Number(transferTo) });
      setDeleteModal(null);
      setTransferTo('');
      setMsg('Envelope removed');
      load();
    } catch (err) { setError(err.message); }
  };

  // ── Set Goal ──
  const handleSetGoal = async () => {
    try {
      await api.updateWallet(goalModal.id, { goalName: goalName || null, goalAmount: goalAmount ? Number(goalAmount) : null });
      setGoalModal(null);
      setGoalName('');
      setGoalAmount('');
      setMsg(goalName ? 'Goal set!' : 'Goal removed');
      load();
    } catch (err) { setError(err.message); }
  };

  // Auto-clear messages
  useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(''), 3000); return () => clearTimeout(t); } }, [msg]);
  useEffect(() => { if (error) { const t = setTimeout(() => setError(''), 4000); return () => clearTimeout(t); } }, [error]);

  const colors = ['border-l-dusco', 'border-l-blue-500', 'border-l-amber-500', 'border-l-emerald-500', 'border-l-purple-500', 'border-l-pink-500'];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-dark">Manage Envelopes</h2>
          <p className="text-xs text-gray-400">{bahashas.length} envelope{bahashas.length !== 1 ? 's' : ''}</p>
        </div>
        {!rebalancing && (
          <button onClick={startRebalance} className="text-xs text-dusco font-semibold bg-dusco-light px-3 py-1.5 rounded-full">
            Rebalance %
          </button>
        )}
      </div>

      {/* Toast messages */}
      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mx-4 mb-2 bg-success/10 text-success text-xs font-medium rounded-xl px-4 py-2.5 text-center">
            {msg}
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mx-4 mb-2 bg-error/10 text-error text-xs font-medium rounded-xl px-4 py-2.5 text-center">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rebalance mode */}
      {rebalancing && (
        <div className="mx-4 mb-3 bg-dusco-light rounded-2xl p-4">
          <div className="flex h-3 rounded-full overflow-hidden bg-white mb-2">
            {allocations.map((a, i) => {
              const bgColors = ['bg-dusco', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500'];
              return a.percentage > 0 ? <div key={a.id} className={`${bgColors[i % bgColors.length]} transition-all`} style={{ width: `${a.percentage}%` }} /> : null;
            })}
          </div>
          <p className={`text-xs font-medium text-center mb-3 ${Math.abs(total - 100) < 0.01 ? 'text-success' : 'text-error'}`}>
            {total}% / 100%
          </p>
          {allocations.map((a, i) => (
            <div key={a.id} className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-600 w-20 truncate">{a.name}</span>
              <input type="range" min="0" max="100" value={a.percentage} onChange={e => updateAlloc(i, e.target.value)}
                className="flex-1 accent-dusco" />
              <div className="flex items-center bg-white border border-gray-200 rounded-lg px-1.5 w-16">
                <input type="number" min="0" max="100" value={a.percentage} onChange={e => updateAlloc(i, e.target.value)}
                  className="w-full py-1 text-xs text-center border-none bg-transparent focus:outline-none" />
                <span className="text-[10px] text-gray-400">%</span>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <button onClick={() => setRebalancing(false)} className="flex-1 py-2 rounded-xl bg-white text-xs font-medium text-gray-500">Cancel</button>
            <button onClick={saveRebalance} disabled={Math.abs(total - 100) > 0.01}
              className="flex-1 py-2 rounded-xl bg-dusco text-white text-xs font-semibold disabled:opacity-40">Save</button>
          </div>
        </div>
      )}

      {/* Bahasha list */}
      <div className="px-4 space-y-3 flex-1">
        {bahashas.map((b, i) => {
          const isEditing = editing === b.id;
          const daysUntilUnlock = b.lockDate ? Math.max(0, Math.ceil((new Date(b.lockDate) - Date.now()) / 86400000)) : 0;

          return (
            <motion.div key={b.id} layout
              className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden border-l-4 ${colors[i % colors.length]}`}>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {isEditing ? (
                      <form onSubmit={e => { e.preventDefault(); handleEditName(b.id, e.target.name.value); }} className="flex gap-2">
                        <input name="name" defaultValue={b.name} autoFocus
                          className="px-2 py-1 rounded-lg border border-gray-200 text-sm flex-1" />
                        <button type="submit" className="text-xs text-success font-medium">Save</button>
                        <button type="button" onClick={() => setEditing(null)} className="text-xs text-gray-400">Cancel</button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-semibold text-dark">{b.name}</h3>
                        {b.isLocked && <span className="text-xs">🔒</span>}
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{b.percentage}%</span>
                      </div>
                    )}
                    <p className="font-heading font-bold text-lg text-dark mt-1">{formatTZS(b.balance)}</p>
                    {b.goalName && <p className="text-[10px] text-gray-400">{b.goalName}</p>}
                    {b.goalAmount && (
                      <div className="mt-1.5">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (b.balance / b.goalAmount) * 100)}%`, backgroundColor: b.balance >= b.goalAmount ? '#22C55E' : (colors[i % colors.length].includes('dusco') ? '#1B2F8F' : '#3B82F6') }} />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 tabular-nums">
                          {b.balance >= b.goalAmount ? '✓ Goal reached!' : `${formatTZS(b.balance)} / ${formatTZS(b.goalAmount)}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lock info */}
                {b.isLocked && b.lockDate && (
                  <div className="mt-2 bg-warning/10 rounded-xl px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-warning">
                      🔒 Locked · {daysUntilUnlock > 0 ? `${daysUntilUnlock} days left` : 'Lock expired'}
                    </span>
                    <button onClick={() => handleUnlock(b)}
                      className="text-xs text-dusco font-medium">
                      {daysUntilUnlock > 0 ? 'Unlock (2% penalty)' : 'Unlock'}
                    </button>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button onClick={() => setEditing(b.id)}
                    className="flex-1 py-2 rounded-xl bg-gray-50 text-xs font-medium text-gray-600 hover:bg-gray-100 min-w-[70px]">
                    ✏️ Rename
                  </button>
                  <button onClick={() => { setGoalModal(b); setGoalName(b.goalName || ''); setGoalAmount(b.goalAmount ? String(b.goalAmount) : ''); }}
                    className="flex-1 py-2 rounded-xl bg-gray-50 text-xs font-medium text-gray-600 hover:bg-gray-100 min-w-[70px]">
                    🎯 Goal
                  </button>
                  {!b.isLocked ? (
                    <button onClick={() => setLockModal(b)}
                      className="flex-1 py-2 rounded-xl bg-gray-50 text-xs font-medium text-gray-600 hover:bg-gray-100 min-w-[70px]">
                      🔒 Lock
                    </button>
                  ) : null}
                  {bahashas.length > 2 && (
                    <button onClick={() => { setDeleteModal(b); setTransferTo(''); }}
                      className="flex-1 py-2 rounded-xl bg-gray-50 text-xs font-medium text-error hover:bg-red-50 min-w-[70px]">
                      🗑️ Remove
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Add new */}
        {bahashas.length < 6 && !addMode && (
          <button onClick={() => setAddMode(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-dusco hover:text-dusco transition">
            + Add Envelope ({bahashas.length}/6)
          </button>
        )}

        {addMode && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-dusco/30 p-4 shadow-sm">
            <h4 className="font-heading font-semibold text-sm mb-3">New Envelope</h4>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Envelope name"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm mb-2 bg-gray-50" />
            <div className="flex items-center gap-2 mb-3">
              <input type="range" min="0" max="100" value={newPct} onChange={e => setNewPct(Number(e.target.value))}
                className="flex-1 accent-dusco" />
              <span className="text-sm font-medium w-12 text-center">{newPct}%</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setAddMode(false); setNewName(''); setNewPct(0); }}
                className="flex-1 py-2 rounded-xl bg-gray-100 text-xs font-medium text-gray-500">Cancel</button>
              <button onClick={handleAdd}
                className="flex-1 py-2 rounded-xl bg-dusco text-white text-xs font-semibold">Add</button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="h-4" />

      {/* Lock Modal */}
      {lockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6" onClick={() => setLockModal(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-lg mb-1">Lock "{lockModal.name}"</h3>
            <p className="text-xs text-gray-400 mb-4">Funds cannot be withdrawn until the lock date. Early unlock costs 2% penalty.</p>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Lock Until</label>
            <input type="date" value={lockDate} onChange={e => setLockDate(e.target.value)}
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm bg-gray-50 mb-4" />
            <div className="flex gap-2">
              <button onClick={() => setLockModal(null)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-sm font-medium text-gray-500">Cancel</button>
              <button onClick={handleLock} className="flex-1 py-3 rounded-2xl bg-dusco text-white text-sm font-semibold">Lock</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6" onClick={() => setDeleteModal(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-lg mb-1">Remove "{deleteModal.name}"</h3>
            {deleteModal.balance > 0 ? (
              <>
                <p className="text-xs text-gray-400 mb-4">
                  This envelope has {formatTZS(deleteModal.balance)}. Transfer the balance to another envelope first.
                </p>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Transfer balance to</label>
                <select value={transferTo} onChange={e => setTransferTo(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm bg-gray-50 mb-4">
                  <option value="">Select envelope</option>
                  {bahashas.filter(x => x.id !== deleteModal.id).map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({formatTZS(b.balance)})</option>
                  ))}
                </select>
              </>
            ) : (
              <p className="text-xs text-gray-400 mb-4">This envelope has no balance. It will be removed.</p>
            )}
            <div className="flex gap-2">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-sm font-medium text-gray-500">Cancel</button>
              <button onClick={handleDelete} disabled={deleteModal.balance > 0 && !transferTo}
                className="flex-1 py-3 rounded-2xl bg-error text-white text-sm font-semibold disabled:opacity-40">Remove</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Goal Modal */}
      {goalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6" onClick={() => setGoalModal(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-lg mb-1">🎯 Set Goal for "{goalModal.name}"</h3>
            <p className="text-xs text-gray-400 mb-4">Track progress toward a savings target</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Goal Name</label>
                <input value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="e.g. New Laptop, Holiday Trip"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Target Amount (TZS)</label>
                <input type="number" value={goalAmount} onChange={e => setGoalAmount(e.target.value)} placeholder="e.g. 1500000"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm bg-gray-50" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {goalModal.goalName && (
                <button onClick={() => { setGoalName(''); setGoalAmount(''); handleSetGoal(); }}
                  className="py-3 px-4 rounded-2xl bg-gray-100 text-sm font-medium text-error">Clear Goal</button>
              )}
              <button onClick={() => setGoalModal(null)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-sm font-medium text-gray-500">Cancel</button>
              <button onClick={handleSetGoal} disabled={goalName && !goalAmount}
                className="flex-1 py-3 rounded-2xl bg-dusco text-white text-sm font-semibold disabled:opacity-40">Save</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
