import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { formatTZS } from '../utils/format';

const NETWORKS = ['M-Pesa', 'Tigo Pesa', 'Airtel', 'Halotel', 'CRDB', 'NMB', 'Selcom'];
const QUICK_AMOUNTS = [10000, 50000, 100000, 500000];
const SETTLEMENT_NETWORK = 'M-Pesa';

export default function DepositModal({ onClose, onSuccess, bahashas }) {
  const [step, setStep] = useState('input');
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState('M-Pesa');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const amt = Number(amount);
  const isSameNetwork = network === SETTLEMENT_NETWORK;
  const fee = isSameNetwork ? 0 : Math.max(500, Math.round(amt * 0.01));
  const net = amt - fee;

  const handleDeposit = async () => {
    if (!amt || amt <= 0) return setError('Enter a valid amount');
    setError('');
    setLoading(true);
    try {
      const data = await api.deposit({ amount: amt, sourceNetwork: network });
      setResult(data);
      setStep('processing');
      setTimeout(() => setStep('animation'), 1500);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3" />

        {step === 'input' && (
          <div className="p-6">
            <h2 className="text-xl font-black text-dark mb-6">Deposit</h2>

            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Amount (TZS)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xl font-black bg-surface" />
            <div className="flex gap-2 mt-2 mb-4">
              {QUICK_AMOUNTS.map(a => (
                <button key={a} onClick={() => setAmount(String(a))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${String(a) === amount ? 'bg-dusco text-white' : 'bg-surface text-gray-500 hover:bg-gray-200'}`}>
                  {a >= 1000 ? `${a / 1000}k` : a}
                </button>
              ))}
            </div>

            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Source Network</label>
            <select value={network} onChange={e => setNetwork(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-surface mb-4">
              {NETWORKS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            {amt > 0 && (
              <div className="bg-surface rounded-xl p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold">{formatTZS(amt)}</span></div>
                {fee > 0 ? (
                  <div className="flex justify-between"><span className="text-gray-500">Cross-network fee (1%)</span><span className="text-error font-bold">-{formatTZS(fee)}</span></div>
                ) : (
                  <div className="flex justify-between"><span className="text-gray-500">Fee</span><span className="text-success font-bold">Free — same network</span></div>
                )}
                <div className="flex justify-between font-black border-t border-gray-200 pt-2">
                  <span>You receive</span><span className="text-success">{formatTZS(net > 0 ? net : 0)}</span>
                </div>
              </div>
            )}

            {net > 0 && (
              <div className="mb-5">
                <p className="text-xs text-gray-400 mb-2">Split preview:</p>
                {bahashas.map(b => (
                  <div key={b.id} className="flex justify-between py-1 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                      {b.name} ({b.percentage}%)
                    </span>
                    <span className="font-bold tabular-nums">{formatTZS(Math.round(net * b.percentage / 100))}</span>
                  </div>
                ))}
              </div>
            )}

            {error && <p className="text-error text-xs text-center mb-3">{error}</p>}
            <button onClick={handleDeposit} disabled={loading || !amt}
              className="w-full py-3.5 bg-dusco text-white font-bold rounded-xl hover:bg-dusco-dark transition disabled:opacity-40 active:scale-[0.98]">
              {loading ? 'Processing...' : 'Confirm Deposit'}
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-6 py-20 text-center">
            <div className="w-12 h-12 border-4 border-dusco border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-sm text-gray-400">Processing via {result?.sourceNetwork}...</p>
          </div>
        )}

        {step === 'animation' && result && (
          <div className="p-6">
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.1 }}
              className="text-center mb-6">
              <span className="text-4xl">💰</span>
              <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-3xl font-black text-success mt-2 tabular-nums">{formatTZS(result.grossAmount)}</motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-sm text-gray-400 mt-1">deposited via {result.sourceNetwork}</motion.p>
              {result.crossNetworkFee > 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                  className="text-xs text-gray-400">Fee: {formatTZS(result.crossNetworkFee)}</motion.p>
              )}
            </motion.div>

            <div className="space-y-3 mb-8">
              {result.splits.map((split, i) => (
                <motion.div key={split.bahashaId}
                  initial={{ opacity: 0, x: -40, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: 'spring', delay: 0.7 + i * 0.15, damping: 15, stiffness: 200 }}
                  className="rounded-xl p-4 flex items-center justify-between"
                  style={{ backgroundColor: `${split.color}10`, borderLeft: `4px solid ${split.color}` }}>
                  <div>
                    <p className="font-bold text-sm text-dark">{split.bahashaName}</p>
                    <p className="text-[10px] text-gray-400">{split.percentage}%</p>
                  </div>
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.9 + i * 0.15, damping: 10 }}
                    className="font-black text-lg tabular-nums" style={{ color: split.color }}>
                    +{formatTZS(split.amount)}
                  </motion.span>
                </motion.div>
              ))}
            </div>

            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 + result.splits.length * 0.15 }}
              onClick={() => { onSuccess(); onClose(); }}
              className="w-full py-3.5 bg-dusco text-white font-bold rounded-xl hover:bg-dusco-dark transition active:scale-[0.98]">
              Done
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
