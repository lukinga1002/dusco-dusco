import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { formatTZS, formatDate, formatDateTime } from '../utils/format';

function KpiCard({ label, value, sub, icon }) {
  return (
    <div className="bg-dark-soft rounded-2xl p-4 border border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-heading font-bold text-xl text-white">{value}</p>
      {sub && <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState({ transactions: [], total: 0 });
  const [txOffset, setTxOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('dusco_admin_token');
    if (!token) { navigate('/admin/login'); return; }
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [d, u] = await Promise.all([api.adminDashboard(), api.adminUsers()]);
      setDashboard(d);
      setUsers(u.users);
    } catch (err) {
      if (err.message.includes('Admin')) { localStorage.removeItem('dusco_admin_token'); navigate('/admin/login'); }
    }
    setLoading(false);
  };

  const loadTransactions = async (offset = 0) => {
    try {
      const data = await api.adminTransactions(`limit=25&offset=${offset}`);
      setTransactions(data);
      setTxOffset(offset);
    } catch (err) { console.error(err); }
  };

  const loadUserDetail = async (id) => {
    try {
      const data = await api.adminUserDetail(id);
      setSelectedUser(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (tab === 'transactions') loadTransactions(0); }, [tab]);

  const handleLogout = () => {
    localStorage.removeItem('dusco_admin_token');
    navigate('/admin/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-dusco border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'transactions', label: 'Transactions', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-dark">
      {/* Admin header */}
      <div className="bg-dark-soft border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold text-dusco">dusco</span>
          <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">admin</span>
        </div>
        <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-white">Sign Out</button>
      </div>

      {/* Tab bar */}
      <div className="bg-dark-soft border-b border-gray-700 flex">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setSelectedUser(null); }}
            className={`flex-1 py-3 text-xs font-medium text-center transition ${tab === t.id ? 'text-dusco border-b-2 border-dusco' : 'text-gray-500'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* ── Dashboard Tab ── */}
        {tab === 'dashboard' && dashboard && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <KpiCard icon="👥" label="Users" value={dashboard.overview.totalUsers} />
              <KpiCard icon="📁" label="Bahashas" value={dashboard.overview.totalBahashas} />
              <KpiCard icon="💰" label="Total Funds" value={formatTZS(dashboard.overview.totalFunds)} />
              <KpiCard icon="💳" label="Fee Revenue" value={formatTZS(dashboard.revenue.totalFeeRevenue)} />
            </div>

            {/* Float investment */}
            <div className="bg-dark-soft rounded-2xl p-5 border border-gray-700">
              <h3 className="font-heading font-semibold text-sm text-white mb-4">Float Investment Simulation</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total float</span>
                  <span className="text-white font-medium">{formatTZS(dashboard.floatInvestment.totalFloat)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Annual return rate</span>
                  <span className="text-white font-medium">{dashboard.floatInvestment.annualReturnRate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Simulated annual return</span>
                  <span className="text-success font-medium">{formatTZS(dashboard.floatInvestment.simulatedAnnualReturn)}</span>
                </div>
                <div className="border-t border-gray-700 pt-2 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Company profit ({dashboard.floatInvestment.profitSplit.company})</span>
                    <span className="text-white font-medium">{formatTZS(dashboard.floatInvestment.companyProfit)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">User dividend pool ({dashboard.floatInvestment.profitSplit.users})</span>
                    <span className="text-dusco font-medium">{formatTZS(dashboard.floatInvestment.userDividendPool)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Dividends paid to date</span>
                    <span className="text-white font-medium">{formatTZS(dashboard.floatInvestment.totalDividendsPaid)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fee breakdown */}
            <div className="bg-dark-soft rounded-2xl p-5 border border-gray-700">
              <h3 className="font-heading font-semibold text-sm text-white mb-4">Fee Revenue Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Cross-network fees</span>
                  <span className="text-white font-medium">{formatTZS(dashboard.revenue.crossNetworkFees)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Withdrawal fees</span>
                  <span className="text-white font-medium">{formatTZS(dashboard.revenue.withdrawalFees)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Penalty fees</span>
                  <span className="text-white font-medium">{formatTZS(dashboard.revenue.penaltyFees)}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-gray-700 pt-2">
                  <span className="text-gray-400 font-medium">Total</span>
                  <span className="text-success font-bold">{formatTZS(dashboard.revenue.totalFeeRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="bg-dark-soft rounded-2xl p-5 border border-gray-700">
              <h3 className="font-heading font-semibold text-sm text-white mb-4">Bahasha Categories (All Users)</h3>
              <div className="space-y-2">
                {dashboard.categoryBreakdown.map(c => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{c.name} <span className="text-gray-600">({c.count})</span></span>
                    <span className="text-white font-medium">{formatTZS(c.totalBalance)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction stats */}
            <div className="bg-dark-soft rounded-2xl p-5 border border-gray-700">
              <h3 className="font-heading font-semibold text-sm text-white mb-4">Transaction Volume</h3>
              <div className="space-y-2">
                {dashboard.transactionStats.map(s => (
                  <div key={s.type} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 capitalize">{s.type} <span className="text-gray-600">({s.count})</span></span>
                    <span className="text-white font-medium">{formatTZS(s.volume)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Users Tab ── */}
        {tab === 'users' && !selectedUser && (
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-sm text-gray-400">{users.length} Registered Users</h3>
            {users.map(u => (
              <button key={u.id} onClick={() => loadUserDetail(u.id)}
                className="w-full bg-dark-soft rounded-2xl p-4 border border-gray-700 text-left hover:border-gray-500 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-heading font-semibold text-white text-sm">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.phone} · {u.duscoNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-bold text-white text-sm">{formatTZS(u.totalBalance)}</p>
                    <p className="text-[10px] text-gray-500">{u.bahashaCount} envelopes</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-600 mt-1">Joined {formatDate(u.createdAt)}</p>
              </button>
            ))}
          </div>
        )}

        {/* ── User Detail ── */}
        {tab === 'users' && selectedUser && (
          <div className="space-y-4">
            <button onClick={() => setSelectedUser(null)} className="text-xs text-dusco flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              Back to users
            </button>

            <div className="bg-dark-soft rounded-2xl p-5 border border-gray-700">
              <h3 className="font-heading font-bold text-lg text-white">{selectedUser.user.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{selectedUser.user.phone} · {selectedUser.user.duscoNumber}</p>
              <p className="text-[10px] text-gray-600 mt-1">Joined {formatDate(selectedUser.user.createdAt)}</p>
            </div>

            <div className="bg-dark-soft rounded-2xl p-5 border border-gray-700">
              <h4 className="font-heading font-semibold text-sm text-gray-400 mb-3">Envelopes</h4>
              <div className="space-y-2">
                {selectedUser.bahashas.map(b => (
                  <div key={b.id} className="flex items-center justify-between bg-dark rounded-xl p-3">
                    <div>
                      <span className="text-sm text-white font-medium">{b.name}</span>
                      <span className="text-[10px] text-gray-500 ml-2">{b.percentage}%</span>
                      {b.isLocked && <span className="ml-1 text-[10px]">🔒</span>}
                    </div>
                    <span className="font-heading font-bold text-white text-sm">{formatTZS(b.balance)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-dark-soft rounded-2xl p-5 border border-gray-700">
              <h4 className="font-heading font-semibold text-sm text-gray-400 mb-3">Recent Transactions</h4>
              <div className="space-y-2">
                {selectedUser.recentTransactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between text-xs bg-dark rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white truncate">{t.description}</p>
                      <p className="text-gray-600 text-[10px]">{formatDateTime(t.createdAt)}{t.bahashaName ? ` · ${t.bahashaName}` : ''}</p>
                    </div>
                    <span className={`shrink-0 ml-2 font-heading font-semibold ${t.amount >= 0 ? 'text-success' : 'text-error'}`}>
                      {t.amount >= 0 ? '+' : ''}{formatTZS(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Transactions Tab ── */}
        {tab === 'transactions' && (
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-sm text-gray-400">{transactions.total} Total Transactions</h3>
            <div className="space-y-2">
              {transactions.transactions.map(t => (
                <div key={t.id} className="bg-dark-soft rounded-2xl p-3 border border-gray-700 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        t.type === 'deposit' ? 'bg-success/20 text-success' :
                        t.type === 'withdrawal' ? 'bg-error/20 text-error' :
                        t.type === 'dividend' ? 'bg-dusco/20 text-dusco' :
                        'bg-gray-700 text-gray-400'
                      }`}>{t.type}</span>
                      <span className="text-xs text-gray-500">{t.userName}</span>
                      <span className="text-[10px] text-gray-600 font-mono">{t.duscoNumber}</span>
                    </div>
                    <p className="text-xs text-white truncate mt-1">{t.description}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">
                      {formatDateTime(t.createdAt)}
                      {t.bahashaName ? ` · ${t.bahashaName}` : ''}
                      {t.fee > 0 ? ` · Fee: ${formatTZS(t.fee)}` : ''}
                    </p>
                  </div>
                  <span className={`text-sm font-heading font-semibold shrink-0 ${t.amount >= 0 ? 'text-success' : 'text-error'}`}>
                    {t.amount >= 0 ? '+' : ''}{formatTZS(t.amount)}
                  </span>
                </div>
              ))}
            </div>
            {/* Pagination */}
            {transactions.total > 25 && (
              <div className="flex items-center justify-center gap-3 py-2">
                <button onClick={() => loadTransactions(Math.max(0, txOffset - 25))} disabled={txOffset === 0}
                  className="px-3 py-1.5 rounded-xl bg-dark-soft border border-gray-700 text-xs text-gray-400 disabled:opacity-30">← Prev</button>
                <span className="text-xs text-gray-500">{Math.floor(txOffset / 25) + 1} of {Math.ceil(transactions.total / 25)}</span>
                <button onClick={() => loadTransactions(txOffset + 25)} disabled={txOffset + 25 >= transactions.total}
                  className="px-3 py-1.5 rounded-xl bg-dark-soft border border-gray-700 text-xs text-gray-400 disabled:opacity-30">Next →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
