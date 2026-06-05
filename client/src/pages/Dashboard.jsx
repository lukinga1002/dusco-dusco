import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { formatTZS, formatDateTime } from '../utils/format';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import SendModal from '../components/SendModal';
import FlipBahashaCard from '../components/FlipBahashaCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [cardTxns, setCardTxns] = useState({});
  const [copied, setCopied] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showValues, setShowValues] = useState(false);

  const loadData = async () => {
    try {
      const [w, t] = await Promise.all([api.getWallets(), api.getTransactions('limit=10')]);
      setWalletData(w);
      setTransactions(t.transactions);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData(); }, []);

  const toggleCard = async (id) => {
    if (expandedCard === id) { setExpandedCard(null); return; }
    setExpandedCard(id);
    if (!cardTxns[id]) {
      try {
        const data = await api.getTransactions(`bahashaId=${id}&limit=5`);
        setCardTxns(prev => ({ ...prev, [id]: data.transactions }));
      } catch (err) { console.error(err); }
    }
  };

  const copyDuscoNumber = () => {
    navigator.clipboard.writeText(user?.duscoNumber || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const txnIcon = { deposit: '💰', withdrawal: '💸', fee: '💳', dividend: '🎉', transfer: '🔄', penalty: '⚠️' };

  if (!walletData) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-dusco border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Hero */}
      <div className="hero-gradient px-6 pt-5 pb-6 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute right-6 top-16 w-20 h-20 rounded-full bg-white/5" />
        <p className="text-sm text-white/70 mb-1">Habari, {user?.name?.split(' ')[0]} 👋</p>
        <p className="text-[11px] text-white/45 mb-2 uppercase tracking-wider">Total Balance</p>
        <h2 className="text-[2.1rem] leading-none font-black tabular-nums">{formatTZS(walletData.totalBalance)}</h2>
        <button onClick={copyDuscoNumber}
          className="mt-4 inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur rounded-full px-3 py-1.5 text-xs font-medium transition">
          <span className="font-mono tracking-wide">{user?.duscoNumber}</span>
          <span>{copied ? '✓ Copied!' : '📋 Copy'}</span>
        </button>
      </div>

      {/* Quick actions — matched pair, crisp on white */}
      <div className="grid grid-cols-2 gap-3 px-5 mt-4">
        <button onClick={() => setShowDeposit(true)}
          className="h-14 bg-dusco text-white shadow-premium rounded-2xl flex items-center justify-center gap-1.5 font-bold text-sm transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-dusco focus-visible:ring-offset-2">
          <span className="text-base leading-none">💰</span> Add Money
        </button>
        <button onClick={() => setShowSend(true)}
          className="h-14 bg-white text-dark border border-gray-200 shadow-card rounded-2xl flex items-center justify-center gap-1.5 font-bold text-sm transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-dusco focus-visible:ring-offset-2">
          <span className="text-base leading-none">📤</span> Send
        </button>
      </div>

      {/* Bahasha cards */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-gray-500">Your Bahashas</h3>
          <button onClick={() => setShowValues(v => !v)}
            className="flex items-center gap-1.5 text-xs font-bold text-dusco bg-dusco-light px-3 py-1.5 rounded-full transition active:scale-95">
            {showValues ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            )}
            {showValues ? 'Hide values' : 'Show values'}
          </button>
        </div>
        <div className="space-y-3">
          {walletData.bahashas.map(b => (
            <FlipBahashaCard
              key={b.id}
              bahasha={b}
              revealed={showValues}
              expanded={expandedCard === b.id}
              onToggleExpand={() => toggleCard(b.id)}
              onWithdraw={setShowWithdraw}
              txns={cardTxns[b.id]}
              txnIcon={txnIcon}
            />
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="px-5 mt-6 pb-6">
        <h3 className="font-bold text-sm text-gray-500 mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <p className="text-center text-sm text-gray-300 py-6">No transactions yet</p>
          ) : transactions.map(t => (
            <div key={t.id} className="flex items-center gap-3 bg-surface rounded-xl p-3">
              <span className="text-lg">{txnIcon[t.type] || '📝'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-dark truncate">{t.description}</p>
                <p className="text-[10px] text-gray-500">{formatDateTime(t.createdAt)}{t.bahashaName ? ` · ${t.bahashaName}` : ''}</p>
              </div>
              <span className={`text-sm font-bold tabular-nums ${t.amount >= 0 ? 'text-success' : 'text-error'}`}>
                {t.amount >= 0 ? '+' : ''}{formatTZS(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} onSuccess={loadData} bahashas={walletData.bahashas} duscoNumber={user?.duscoNumber} />}
      {showWithdraw && <WithdrawModal bahasha={showWithdraw} onClose={() => setShowWithdraw(null)} onSuccess={loadData} />}
      {showSend && <SendModal bahashas={walletData.bahashas} onClose={() => setShowSend(false)} onSuccess={loadData} />}
    </div>
  );
}
