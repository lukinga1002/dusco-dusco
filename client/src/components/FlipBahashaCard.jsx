import { motion, AnimatePresence } from 'framer-motion';
import { formatTZS } from '../utils/format';

/**
 * A bahasha "bar" that hides its amount by default.
 * Front face (private): name, allocation %, and — if a goal is set —
 * progress toward target as a %. The amount lives on the back.
 * When `revealed` is true, the bar flips on its Y axis to show the amount.
 */
export default function FlipBahashaCard({ bahasha: b, revealed, expanded, onToggleExpand, onWithdraw, txns, txnIcon }) {
  const hasGoal = !!b.goalAmount;
  const goalPct = hasGoal ? Math.min(100, Math.round((b.balance / b.goalAmount) * 100)) : null;
  const reached = hasGoal && b.balance >= b.goalAmount;
  const faceH = hasGoal ? 'h-[92px]' : 'h-[64px]';
  const faceBase = `absolute inset-0 flex items-center gap-3 px-4 ${faceH}`;

  return (
    <motion.div layout className="bg-surface rounded-2xl border border-gray-100 overflow-hidden">
      {/* Flip bar — tap to expand details; global toggle flips to reveal amount */}
      <button onClick={onToggleExpand} className="w-full text-left" style={{ perspective: 1200 }} aria-label={`${b.name}, ${revealed ? formatTZS(b.balance) : 'amount hidden'}`}>
        <motion.div
          animate={{ rotateY: revealed ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className={`relative ${faceH}`}
        >
          {/* FRONT — private */}
          <div className={faceBase} style={{ backfaceVisibility: 'hidden' }}>
            <div className="w-2 self-stretch my-3 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-dark text-sm truncate">{b.name}</h4>
                {b.isLocked && <span className="text-xs">🔒</span>}
                <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{b.percentage}%</span>
              </div>
              {hasGoal ? (
                <div className="mt-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold" style={{ color: reached ? '#16A34A' : b.color }}>
                      {reached ? '✓ Target reached' : `${goalPct}% of target`}
                    </span>
                    <span className="text-[10px] text-gray-400">{b.goalName}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${goalPct}%`, backgroundColor: reached ? '#16A34A' : b.color }} />
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 mt-0.5">Amount hidden · tap 👁 to reveal</p>
              )}
            </div>
            {/* Colorful "hidden value" chip */}
            <div className="shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1.5"
              style={{ background: `linear-gradient(135deg, ${b.color}22, ${b.color}11)` }}>
              <span className="font-black tracking-widest text-sm" style={{ color: b.color }}>••••</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={b.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </div>
            <svg className={`w-4 h-4 text-gray-300 transition shrink-0 ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </div>

          {/* BACK — revealed amount */}
          <div className={faceBase} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="w-2 self-stretch my-3 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-dark text-sm truncate">{b.name}</h4>
                {b.isLocked && <span className="text-xs">🔒</span>}
                <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{b.percentage}%</span>
              </div>
              <p className="font-black text-dark tabular-nums mt-0.5">{formatTZS(b.balance)}</p>
              {hasGoal && (
                <p className="text-[10px] text-gray-500 mt-0.5 tabular-nums">
                  {reached ? '✓ Goal reached!' : `${formatTZS(b.balance)} / ${formatTZS(b.goalAmount)}`}
                </p>
              )}
            </div>
            <svg className={`w-4 h-4 text-gray-300 transition shrink-0 ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </div>
        </motion.div>
      </button>

      {/* Expandable details */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="px-4 pb-4 border-t border-gray-100 pt-3">
              <button onClick={() => onWithdraw(b)}
                className="w-full py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-dark hover:bg-gray-50 transition mb-3">
                💸 Withdraw from {b.name}
              </button>
              {txns ? (
                txns.length > 0 ? txns.map(t => (
                  <div key={t.id} className="flex items-center gap-2 py-1.5 text-xs">
                    <span>{txnIcon[t.type] || '📝'}</span>
                    <span className="flex-1 truncate text-gray-500">{t.description}</span>
                    <span className={`tabular-nums font-bold ${t.amount >= 0 ? 'text-success' : 'text-error'}`}>
                      {t.amount >= 0 ? '+' : ''}{formatTZS(t.amount)}
                    </span>
                  </div>
                )) : <p className="text-xs text-gray-400 text-center py-2">No transactions yet</p>
              ) : <p className="text-xs text-gray-400 text-center py-2">Loading…</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
