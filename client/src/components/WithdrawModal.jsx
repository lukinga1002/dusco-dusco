import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { formatTZS } from '../utils/format';

const NETWORKS = ['M-Pesa', 'Tigo Pesa', 'Airtel', 'Selcom-Pesa', 'CRDB', 'NMB'];

export default function WithdrawModal({ bahasha, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState('M-Pesa');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const amt = Number(amount);
  const rawFee = Math.round(amt * 0.01);
  const fee = Math.max(500, Math.min(rawFee, 5000));
  const displayFee = amt > 0 ? fee : 0;

  const handleWithdraw = async () => {
    if (!amt || amt <= 0) return setError('Enter a valid amount');
    if (amt > bahasha.balance) return setError('Insufficient balance');
    if (!phone) return setError('Enter destination phone');
    setError('');
    setLoading(true);
    try {
      const data = await api.withdraw({ bahashaId: bahasha.id, amount: amt, destinationPhone: phone, destinationNetwork: network });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3" />

        {!result ? (
          <div className="p-6">
            <h2 className="font-heading text-xl font-bold text-dark mb-1">Withdraw</h2>
            <p className="text-sm text-gray-400 mb-6">
              From <span className="font-medium text-dark">{bahasha.name}</span> · Balance: {formatTZS(bahasha.balance)}
            </p>

            {bahasha.isLocked && (
              <div className="bg-warning/10 border border-warning/30 rounded-2xl p-3 mb-4 text-xs text-warning">
                🔒 This bahasha is locked until {bahasha.lockDate}. Early unlock incurs 2% penalty.
              </div>
            )}

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Amount (TZS)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="Enter amount" max={bahasha.balance}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-lg font-heading font-bold bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Destination Phone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="07XXXXXXXX"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Network</label>
                <select value={network} onChange={e => setNetwork(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:bg-white">
                  {NETWORKS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {amt > 0 && (
              <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Withdrawal</span>
                  <span className="font-medium">{formatTZS(amt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fee (1%, floor 500, cap 5,000)</span>
                  <span className="text-error font-medium">{formatTZS(displayFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2">
                  <span>Total deducted</span>
                  <span>{formatTZS(amt + displayFee)}</span>
                </div>
              </div>
            )}

            {error && <p className="text-error text-xs text-center mb-3">{error}</p>}

            <button onClick={handleWithdraw} disabled={loading}
              className="w-full py-3.5 bg-dark text-white font-heading font-semibold rounded-2xl hover:bg-dark-soft transition disabled:opacity-40">
              {loading ? 'Processing...' : 'Confirm Withdrawal'}
            </button>
          </div>
        ) : (
          <div className="p-6 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <span className="text-4xl">{result.feeWaived ? '🎉' : '✅'}</span>
            </motion.div>
            <h2 className="font-heading text-xl font-bold text-dark mt-3">Withdrawal Sent</h2>
            <p className="text-sm text-gray-400 mt-1">{formatTZS(result.amount)} to {result.destination}</p>
            {result.feeWaived && (
              <div className="bg-success/10 text-success text-xs font-medium rounded-full px-3 py-1 inline-block mt-2">
                Fee waived — 90-day savings bonus!
              </div>
            )}
            {!result.feeWaived && result.withdrawalFee > 0 && (
              <p className="text-xs text-gray-400 mt-1">Fee: {formatTZS(result.withdrawalFee)}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">Remaining in {result.bahashaName}: {formatTZS(result.remainingBalance)}</p>
            <button onClick={() => { onSuccess(); onClose(); }}
              className="w-full py-3.5 bg-dusco text-white font-heading font-semibold rounded-2xl mt-6 hover:bg-dusco-dark transition">
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
