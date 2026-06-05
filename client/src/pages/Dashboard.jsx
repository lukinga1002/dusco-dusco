import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { formatTZS, formatDateTime } from '../utils/format';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';

export default function Dashboard() {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [cardTxns, setCardTxns] = useState({});
  const [copied, setCopied] = useState(false);

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
      <div className="hero-gradient px-6 pt-5 pb-10 text-white relative overflow-hidden">
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

      {/* Quick actions */}
      <div className="flex gap-3 px-5 -mt-5">
        <button onClick={() => setShowDeposit(true)}
          className="flex-1 bg-white shadow-premium rounded-2xl py-3.5 text-center font-bold text-sm text-dusco hover:-translate-y-0.5 transition active:scale-[0.98]">
          💰 Add Money
        </button>
        <button disabled className="flex-1 bg-white shadow-card rounded-2xl py-3.5 text-center font-bold text-sm text-gray-300 cursor-not-allowed" title="Coming Soon">
          📤 Send
        </button>
      </div>

      {/* Bahasha cards */}
      <div className="px-5 mt-6">
        <h3 className="font-bold text-sm text-gray-400 mb-3">Your Bahashas</h3>
        <div className="space-y-3">
          {walletData.bahashas.map(b => {
            const isExpanded = expandedCard === b.id;
            return (
              <motion.div key={b.id} layout className="bg-surface rounded-2xl border border-gray-100 overflow-hidden">
                <button onClick={() => toggleCard(b.id)}
                  className="w-full p-4 text-left flex items-center gap-3">
                  <div className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-dark text-sm">{b.name}</h4>
                      {b.isLocked && <span className="text-xs">🔒</span>}
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{b.percentage}%</span>
                    </div>
                    <p className="font-black text-dark tabular-nums mt-0.5">{formatTZS(b.balance)}</p>
                    {b.goalName && <p className="text-[10px] text-gray-400 mt-0.5">{b.goalName}</p>}
                    {b.goalAmount && (
                      <div className="mt-1.5">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (b.balance / b.goalAmount) * 100)}%`, backgroundColor: b.balance >= b.goalAmount ? '#22C55E' : b.color }} />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 tabular-nums">
                          {b.balance >= b.goalAmount ? '✓ Goal reached!' : `${formatTZS(b.balance)} / ${formatTZS(b.goalAmount)}`}
                        </p>
                      </div>
                    )}
                  </div>
                  <svg className={`w-4 h-4 text-gray-300 transition ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                        <button onClick={() => setShowWithdraw(b)}
                          className="w-full py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-dark hover:bg-gray-50 transition mb-3">
                          💸 Withdraw from {b.name}
                        </button>
                        {cardTxns[b.id] ? (
                          cardTxns[b.id].length > 0 ? cardTxns[b.id].map(t => (
                            <div key={t.id} className="flex items-center gap-2 py-1.5 text-xs">
                              <span>{txnIcon[t.type] || '📝'}</span>
                              <span className="flex-1 truncate text-gray-500">{t.description}</span>
                              <span className={`tabular-nums font-bold ${t.amount >= 0 ? 'text-success' : 'text-error'}`}>
                                {t.amount >= 0 ? '+' : ''}{formatTZS(t.amount)}
                              </span>
                            </div>
                          )) : <p className="text-xs text-gray-300 text-center py-2">No transactions yet</p>
                        ) : <p className="text-xs text-gray-300 text-center py-2">Loading...</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className="px-5 mt-6 pb-6">
        <h3 className="font-bold text-sm text-gray-400 mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <p className="text-center text-sm text-gray-300 py-6">No transactions yet</p>
          ) : transactions.map(t => (
            <div key={t.id} className="flex items-center gap-3 bg-surface rounded-xl p-3">
              <span className="text-lg">{txnIcon[t.type] || '📝'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-dark truncate">{t.description}</p>
                <p className="text-[10px] text-gray-400">{formatDateTime(t.createdAt)}{t.bahashaName ? ` · ${t.bahashaName}` : ''}</p>
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
    </div>
  );
}
