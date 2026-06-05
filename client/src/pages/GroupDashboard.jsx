import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { formatTZS, formatDate, formatDateTime } from '../utils/format';

const NETWORKS = ['M-Pesa', 'Tigo Pesa', 'Airtel', 'Halotel', 'CRDB', 'NMB'];

export default function GroupDashboard() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('social');
  const [showContribute, setShowContribute] = useState(false);
  const [contributeType, setContributeType] = useState('both');
  const [network, setNetwork] = useState('M-Pesa');
  const [contributeResult, setContributeResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    try { const d = await api.getGroup(id); setData(d); } catch (err) { console.error(err); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  const handleContribute = async () => {
    setActionLoading(true);
    try {
      const result = await api.groupContribute(id, { type: contributeType, sourceNetwork: network });
      setContributeResult(result);
      load();
    } catch (err) { console.error(err); }
    setActionLoading(false);
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(data?.group?.duscoNumber || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const txnIcon = { share_contribution: '💰', social_contribution: '✉️', withdrawal: '💸', dividend: '🎉' };

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-dusco border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="flex-1 flex items-center justify-center text-gray-500">Group not found</div>;

  const { group, bahashas, members, recentTransactions, userRole, socialBalance, sharesTotal } = data;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="hero-gradient px-5 pt-4 pb-6 text-white">
        <Link to="/groups" className="text-xs text-white/60 flex items-center gap-1 mb-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg> Groups
        </Link>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black flex-1">{group.name}</h2>
          <span className="text-xs bg-white/15 rounded-full px-2 py-0.5">👥 {data.memberCount}</span>
        </div>
        <button onClick={copyNumber} className="mt-2 inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-xs font-mono">
          {group.duscoNumber} {copied ? '✓' : '📋'}
        </button>
        <p className="text-2xl font-black mt-2 tabular-nums">{formatTZS(data.totalBalance)}</p>
        <p className="text-[10px] text-white/50">Shares: {formatTZS(sharesTotal)} · Social: {formatTZS(socialBalance)}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button onClick={() => setTab('social')} className={`flex-1 py-3 text-xs font-bold text-center transition ${tab === 'social' ? 'text-dusco border-b-2 border-dusco' : 'text-gray-500'}`}>Social Fund</button>
        <button onClick={() => setTab('shares')} className={`flex-1 py-3 text-xs font-bold text-center transition ${tab === 'shares' ? 'text-dusco border-b-2 border-dusco' : 'text-gray-500'}`}>Shares</button>
      </div>

      <div className="px-5 pt-4 pb-6">
        {tab === 'social' && (
          <>
            <button onClick={() => { setShowContribute(true); setContributeResult(null); }}
              className="w-full py-3 bg-dusco text-white font-bold rounded-xl text-sm hover:bg-dusco-dark transition mb-4 active:scale-[0.98]">
              💰 Simulate Contribution
            </button>

            <div className="space-y-3 mb-6">
              {bahashas.map(b => (
                <div key={b.id} className="bg-surface rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-8 rounded-full" style={{ backgroundColor: b.color }} />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-dark">{b.name}</h4>
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Group</span>
                        </div>
                        {b.goalName && <p className="text-[10px] text-gray-500">{b.goalName}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-dark tabular-nums">{formatTZS(b.balance)}</p>
                      <p className="text-[10px] text-gray-500">{b.percentage}%</p>
                    </div>
                  </div>
                  {b.goalAmount && (
                    <div className="mt-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (b.balance / b.goalAmount) * 100)}%`, backgroundColor: b.balance >= b.goalAmount ? '#22C55E' : b.color }} />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{formatTZS(b.balance)} / {formatTZS(b.goalAmount)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <h4 className="font-bold text-xs text-gray-500 mb-2">Recent Social Activity</h4>
            <div className="space-y-2">
              {recentTransactions.filter(t => t.type !== 'share_contribution').slice(0, 8).map(t => (
                <div key={t.id} className="flex items-center gap-2 bg-surface rounded-xl p-3 text-xs">
                  <span>{txnIcon[t.type] || '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-dark truncate">{t.description}</p>
                    <p className="text-[10px] text-gray-500">{t.userName} · {formatDateTime(t.createdAt)}</p>
                  </div>
                  <span className={`font-bold tabular-nums ${t.amount >= 0 ? 'text-success' : 'text-error'}`}>
                    {t.amount >= 0 ? '+' : ''}{formatTZS(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'shares' && (
          <>
            <div className="bg-surface rounded-xl p-5 text-center mb-4 border border-gray-100">
              <p className="text-xs text-gray-500">Total Shares Pool</p>
              <p className="text-2xl font-black text-dark tabular-nums mt-1">{formatTZS(sharesTotal)}</p>
            </div>

            <h4 className="font-bold text-xs text-gray-500 mb-2 uppercase tracking-wider">Member Contributions</h4>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-3 gap-2 px-4 py-2 bg-surface text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <span>Member</span><span className="text-right">Total Shares</span><span className="text-right">Last</span>
              </div>
              {members.sort((a, b) => b.sharesTotal - a.sharesTotal).map((m, i) => (
                <div key={m.id} className={`grid grid-cols-3 gap-2 px-4 py-3 text-xs ${i % 2 === 0 ? '' : 'bg-surface/50'}`}>
                  <span className="font-medium text-dark">{m.name}{m.role !== 'member' && <span className="text-[10px] text-dusco ml-1">({m.role})</span>}</span>
                  <span className="text-right font-bold tabular-nums">{formatTZS(m.sharesTotal)}</span>
                  <span className="text-right text-gray-500">{m.lastContribution ? formatDate(m.lastContribution) : '—'}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Contribute Modal */}
      <AnimatePresence>
        {showContribute && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={() => setShowContribute(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

              {!contributeResult ? (
                <>
                  <h3 className="font-black text-lg text-dark mb-4">Simulate Contribution</h3>
                  <div className="space-y-3 mb-4">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Contribution Type</label>
                    <div className="flex gap-2">
                      {[{ v: 'both', l: 'Both' }, { v: 'shares', l: 'Shares Only' }, { v: 'social', l: 'Social Only' }].map(o => (
                        <button key={o.v} onClick={() => setContributeType(o.v)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${contributeType === o.v ? 'bg-dusco text-white' : 'bg-surface text-gray-500'}`}>{o.l}</button>
                      ))}
                    </div>

                    {(contributeType === 'social' || contributeType === 'both') && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Source Network</label>
                        <select value={network} onChange={e => setNetwork(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-surface">
                          {NETWORKS.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    )}

                    <div className="bg-surface rounded-xl p-4 text-xs space-y-1.5">
                      {(contributeType === 'shares' || contributeType === 'both') && (
                        <div className="flex justify-between"><span className="text-gray-500">Shares</span><span className="font-bold">{formatTZS(group.contributionSharesAmount)}</span></div>
                      )}
                      {(contributeType === 'social' || contributeType === 'both') && (
                        <div className="flex justify-between"><span className="text-gray-500">Social fund</span><span className="font-bold">{formatTZS(group.contributionSocialAmount)}</span></div>
                      )}
                    </div>
                  </div>
                  <button onClick={handleContribute} disabled={actionLoading}
                    className="w-full py-3.5 bg-dusco text-white font-bold rounded-xl hover:bg-dusco-dark transition disabled:opacity-40">
                    {actionLoading ? 'Processing...' : 'Confirm Contribution'}
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl inline-block">✅</motion.span>
                  <h3 className="font-black text-lg mt-3">Contribution Recorded</h3>
                  {contributeResult.sharesAmount > 0 && <p className="text-sm text-gray-500 mt-1">Shares: {formatTZS(contributeResult.sharesAmount)}</p>}
                  {contributeResult.splits?.length > 0 && (
                    <div className="space-y-2 mt-4 text-left">
                      {contributeResult.splits.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                          className="flex items-center justify-between bg-surface rounded-xl p-3" style={{ borderLeft: `3px solid ${s.color}` }}>
                          <span className="text-xs font-bold">{s.bahashaName} ({s.percentage}%)</span>
                          <span className="text-xs font-black text-success">+{formatTZS(s.amount)}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setShowContribute(false)}
                    className="w-full py-3.5 bg-dusco text-white font-bold rounded-xl mt-6 hover:bg-dusco-dark transition">Done</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
