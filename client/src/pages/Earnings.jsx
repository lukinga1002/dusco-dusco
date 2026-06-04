import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { formatTZS, formatDate } from '../utils/format';

export default function Earnings() {
  const [projection, setProjection] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDividendProjection(), api.getDividendHistory()])
      .then(([p, h]) => { setProjection(p); setHistory(h); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-dusco border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Hero */}
      <div className="bg-gradient-to-br from-dusco to-dusco-dark px-6 pt-6 pb-8 text-white">
        <p className="text-xs text-white/70 mb-1">Projected Annual Dividend</p>
        <motion.h2 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="font-heading text-3xl font-bold">
          {formatTZS(projection?.projectedUserDividend || 0)}
        </motion.h2>
        <p className="text-xs text-white/60 mt-1">
          ≈ {formatTZS(projection?.projectedMonthlyEquivalent || 0)}/month
        </p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* How it works card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-heading font-semibold text-sm text-dark mb-3">How Dividends Work</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-dusco-light flex items-center justify-center shrink-0">
                <span className="text-sm">💰</span>
              </div>
              <div>
                <p className="text-xs font-medium text-dark">Your savings earn returns</p>
                <p className="text-[10px] text-gray-400">Funds are invested in government securities (T-bills)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-dusco-light flex items-center justify-center shrink-0">
                <span className="text-sm">📊</span>
              </div>
              <div>
                <p className="text-xs font-medium text-dark">Estimated {projection?.annualReturnRate} annual return</p>
                <p className="text-[10px] text-gray-400">Based on current T-bill yields</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-dusco-light flex items-center justify-center shrink-0">
                <span className="text-sm">🤝</span>
              </div>
              <div>
                <p className="text-xs font-medium text-dark">You get 30% of profits</p>
                <p className="text-[10px] text-gray-400">Distributed proportionally by your average balance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Projection breakdown */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-heading font-semibold text-sm text-dark mb-3">Your Projection</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Total balance</span>
              <span className="font-medium">{formatTZS(projection?.totalBalance || 0)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Annual return rate</span>
              <span className="font-medium">{projection?.annualReturnRate}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Estimated annual return</span>
              <span className="font-medium">{formatTZS(projection?.estimatedAnnualReturn || 0)}</span>
            </div>
            <div className="flex justify-between text-xs border-t border-gray-100 pt-2">
              <span className="text-gray-500">Company share (70%)</span>
              <span className="text-gray-400">{formatTZS(Math.round((projection?.estimatedAnnualReturn || 0) * 0.7))}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-medium">Your share (30%)</span>
              <span className="font-bold text-success">{formatTZS(projection?.projectedUserDividend || 0)}</span>
            </div>
          </div>
        </div>

        {/* Per-bahasha breakdown */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-heading font-semibold text-sm text-dark mb-3">Per Envelope Breakdown</h3>
          <div className="space-y-2.5">
            {projection?.perBahasha?.map((b, i) => {
              const barColors = ['bg-dusco', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500'];
              return (
                <div key={b.id}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-gray-600 font-medium">{b.name}</span>
                    <span className="text-success font-semibold">+{formatTZS(b.projectedDividend)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColors[i % barColors.length]}`}
                        style={{ width: `${b.shareOfTotal}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400 w-8">{b.shareOfTotal}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {projection?.defaultRecipientBahasha && (
            <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2 text-[10px] text-gray-400">
              Dividends credited to: <span className="font-medium text-dark">{projection.defaultRecipientBahasha.name}</span> (largest balance)
            </div>
          )}
        </div>

        {/* Dividend history */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <h3 className="font-heading font-semibold text-sm text-dark mb-3">Dividend History</h3>
          {history?.dividends?.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-4">No dividends credited yet</p>
          ) : (
            <>
              <div className="bg-success/10 rounded-xl px-4 py-3 text-center mb-3">
                <p className="text-xs text-gray-500">Total Earned</p>
                <p className="font-heading font-bold text-lg text-success">{formatTZS(history?.totalEarned || 0)}</p>
              </div>
              <div className="space-y-2">
                {history?.dividends?.map(d => (
                  <div key={d.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <span className="text-lg">🎉</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-dark">{d.description}</p>
                      <p className="text-[10px] text-gray-400">{formatDate(d.creditedAt)} · {d.bahashaName}</p>
                    </div>
                    <span className="text-sm font-heading font-bold text-success">+{formatTZS(d.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
