import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { formatTZS, formatDateTime } from '../utils/format';

const TYPES = ['all', 'deposit', 'withdrawal', 'fee', 'dividend', 'transfer', 'penalty'];
const TYPE_ICONS = { deposit: '💰', withdrawal: '💸', fee: '💳', dividend: '🎉', transfer: '🔄', penalty: '⚠️' };

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [bahashas, setBahashas] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState('all');
  const [filterBahasha, setFilterBahasha] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', limit);
      params.set('offset', offset);
      if (filterType !== 'all') params.set('type', filterType);
      if (filterBahasha !== 'all') params.set('bahashaId', filterBahasha);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate + 'T23:59:59');

      const [txData, wData] = await Promise.all([
        api.getTransactions(params.toString()),
        bahashas.length ? Promise.resolve(null) : api.getWallets(),
      ]);
      setTransactions(txData.transactions);
      setTotal(txData.total);
      if (wData) setBahashas(wData.bahashas);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { setOffset(0); }, [filterType, filterBahasha, startDate, endDate]);
  useEffect(() => { loadData(); }, [filterType, filterBahasha, startDate, endDate, offset]);

  const pages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="px-4 pt-4 pb-2">
        <h2 className="font-heading text-lg font-bold text-dark">Transaction History</h2>
        <p className="text-xs text-gray-400">{total} transaction{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className="px-4 pb-3 space-y-2">
        {/* Type filter chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {TYPES.map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${filterType === t ? 'bg-dusco text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Bahasha + date filters */}
        <div className="flex gap-2">
          <select value={filterBahasha} onChange={e => setFilterBahasha(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50">
            <option value="all">All envelopes</option>
            {bahashas.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="px-2 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 w-[110px]" />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="px-2 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 w-[110px]" />
        </div>
      </div>

      {/* Transaction list */}
      <div className="px-4 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-dusco border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-3xl">📭</span>
            <p className="text-sm text-gray-400 mt-2">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map(t => (
              <div key={t.id} className="bg-gray-50 rounded-2xl p-3 flex items-center gap-3">
                <span className="text-lg shrink-0">{TYPE_ICONS[t.type] || '📝'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-dark truncate">{t.description}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {formatDateTime(t.createdAt)}
                    {t.bahashaName ? ` · ${t.bahashaName}` : ''}
                    {t.sourceNetwork ? ` · via ${t.sourceNetwork}` : ''}
                    {t.destination ? ` → ${t.destination}` : ''}
                  </p>
                  {t.fee > 0 && <p className="text-[10px] text-warning mt-0.5">Fee: {formatTZS(t.fee)}</p>}
                </div>
                <span className={`text-sm font-heading font-semibold shrink-0 ${t.amount >= 0 ? 'text-success' : 'text-error'}`}>
                  {t.amount >= 0 ? '+' : ''}{formatTZS(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 py-4 px-4">
          <button onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0}
            className="px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-medium disabled:opacity-30">
            ← Prev
          </button>
          <span className="text-xs text-gray-400">{currentPage} of {pages}</span>
          <button onClick={() => setOffset(offset + limit)} disabled={currentPage >= pages}
            className="px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-medium disabled:opacity-30">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
