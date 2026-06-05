import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { formatTZS } from '../utils/format';

const MOBILE_NETWORKS = ['M-Pesa', 'Tigo Pesa', 'Airtel', 'Halotel'];
const BANKS = ['CRDB', 'NMB', 'NBC', 'Equity', 'Exim', 'Stanbic'];

export default function SendModal({ onClose, onSuccess, bahashas }) {
  const [step, setStep] = useState('pick'); // pick | form | processing | done
  const [bahasha, setBahasha] = useState(null);
  const [destType, setDestType] = useState('mobile'); // mobile | bank
  const [network, setNetwork] = useState('M-Pesa');
  const [bank, setBank] = useState('CRDB');
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const amt = Number(amount);
  const fee = amt > 0 ? Math.max(500, Math.min(Math.round(amt * 0.01), 5000)) : 0;
  const netSent = Math.max(0, amt - fee);
  const isMobile = destType === 'mobile';
  const destNetwork = isMobile ? network : bank;
  const destLabel = isMobile ? 'phone number' : 'account number';

  const pick = (b) => {
    setBahasha(b);
    setAmount(String(b.balance)); // default: send the whole bahasha
    setError('');
    setStep('form');
  };

  const handleSend = async () => {
    if (!amt || amt <= 0) return setError('Enter an amount');
    if (amt > bahasha.balance) return setError('Amount exceeds bahasha balance');
    if (!account.trim()) return setError(`Enter the destination ${destLabel}`);
    setError('');
    setLoading(true);
    setStep('processing');
    try {
      const data = await api.withdraw({
        bahashaId: bahasha.id,
        amount: amt,
        destinationPhone: account.trim(),
        destinationNetwork: destNetwork,
      });
      setResult(data);
      setStep('done');
    } catch (err) {
      setError(err.message);
      setStep('form');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="bg-white rounded-t-3xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-premium" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3" />

        {/* STEP 1 — pick bahasha */}
        {step === 'pick' && (
          <div className="p-6">
            <h2 className="text-xl font-black text-dark mb-1">Send money</h2>
            <p className="text-sm text-gray-500 mb-5">Which bahasha are you sending from?</p>
            <div className="space-y-2.5">
              {bahashas.map(b => {
                const locked = b.isLocked && b.lockUntil && new Date(b.lockUntil) > new Date();
                return (
                  <button key={b.id} onClick={() => !locked && pick(b)} disabled={locked}
                    className={`w-full flex items-center gap-3 rounded-2xl p-4 border text-left transition ${locked ? 'border-gray-100 opacity-50 cursor-not-allowed' : 'border-gray-200 hover:border-dusco hover:bg-dusco-light/30'}`}>
                    <div className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-dark text-sm">{b.name}</span>
                        {locked && <span className="text-xs">🔒</span>}
                      </div>
                      <span className="text-[11px] text-gray-500">{locked ? 'Locked' : 'Available'}</span>
                    </div>
                    <span className="font-black text-dark text-sm tabular-nums">{formatTZS(b.balance)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2 — destination + amount */}
        {step === 'form' && bahasha && (
          <div className="p-6">
            <button onClick={() => setStep('pick')} className="text-xs text-dusco font-bold flex items-center gap-1 mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg> Change bahasha
            </button>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-8 rounded-full" style={{ backgroundColor: bahasha.color }} />
              <div>
                <p className="font-bold text-dark text-sm">{bahasha.name}</p>
                <p className="text-[11px] text-gray-500">Balance: {formatTZS(bahasha.balance)}</p>
              </div>
            </div>

            {/* Destination type toggle */}
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Send to</label>
            <div className="flex gap-1 bg-surface rounded-xl p-1 mb-4">
              <button onClick={() => setDestType('mobile')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${isMobile ? 'bg-white text-dusco shadow-card' : 'text-gray-400'}`}>📱 Mobile money</button>
              <button onClick={() => setDestType('bank')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${!isMobile ? 'bg-white text-dusco shadow-card' : 'text-gray-400'}`}>🏦 Bank account</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">{isMobile ? 'Network' : 'Bank'}</label>
                {isMobile ? (
                  <select value={network} onChange={e => setNetwork(e.target.value)} className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm bg-surface">
                    {MOBILE_NETWORKS.map(n => <option key={n}>{n}</option>)}
                  </select>
                ) : (
                  <select value={bank} onChange={e => setBank(e.target.value)} className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm bg-surface">
                    {BANKS.map(n => <option key={n}>{n}</option>)}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1 capitalize">{destLabel}</label>
                <input value={account} onChange={e => setAccount(e.target.value)}
                  placeholder={isMobile ? '07XXXXXXXX' : 'Acct no.'}
                  className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm bg-surface" />
              </div>
            </div>

            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Amount to take from {bahasha.name} (TZS)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} max={bahasha.balance}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xl font-black bg-surface" />
            <button onClick={() => setAmount(String(bahasha.balance))}
              className="mt-2 mb-4 text-xs font-bold text-dusco bg-dusco-light px-3 py-1.5 rounded-full">
              Send whole bahasha · {formatTZS(bahasha.balance)}
            </button>

            {amt > 0 && (
              <div className="bg-surface rounded-xl p-4 mb-4 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-gray-500">Taken from {bahasha.name}</span><span className="font-bold">{formatTZS(amt)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Fee (1%, max 5,000)</span><span className="text-error font-bold">−{formatTZS(fee)}</span></div>
                <div className="flex justify-between font-black border-t border-gray-200 pt-2"><span>Recipient receives</span><span className="text-success">{formatTZS(netSent)}</span></div>
              </div>
            )}

            {error && <p className="text-error text-xs text-center mb-3">{error}</p>}
            <button onClick={handleSend} disabled={loading}
              className="w-full py-3.5 bg-dusco text-white font-bold rounded-xl hover:bg-dusco-dark transition disabled:opacity-40 active:scale-[0.98]">
              Send {netSent > 0 ? formatTZS(netSent) : 'money'}
            </button>
          </div>
        )}

        {/* PROCESSING */}
        {step === 'processing' && (
          <div className="p-6 py-20 text-center">
            <div className="w-12 h-12 border-4 border-dusco border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-sm text-gray-500 font-medium">Sending {formatTZS(netSent)} to {account}…</p>
            <p className="mt-1 text-xs text-gray-400">{destNetwork}</p>
          </div>
        )}

        {/* DONE */}
        {step === 'done' && result && (
          <div className="p-6 text-center">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-4xl inline-block">✅</motion.span>
            <h2 className="text-xl font-black text-dark mt-3">Money sent</h2>
            <p className="text-sm text-gray-500 mt-1">{formatTZS(result.netSent ?? result.amount)} to {account} · {destNetwork}</p>
            {result.feeWaived
              ? <div className="inline-block mt-2 bg-success/10 text-success text-xs font-bold rounded-full px-3 py-1">Fee waived — 90-day bonus!</div>
              : <p className="text-xs text-gray-400 mt-1">TZS {(result.amount).toLocaleString()} taken · fee {formatTZS(result.withdrawalFee)}</p>}
            <p className="text-xs text-gray-500 mt-3">Remaining in {result.bahashaName}: {formatTZS(result.remainingBalance)}</p>
            <button onClick={() => { onSuccess(); onClose(); }}
              className="w-full py-3.5 bg-dusco text-white font-bold rounded-xl mt-6 hover:bg-dusco-dark transition">Done</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
