import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTZS } from '../utils/format';

/**
 * A bahasha "bar" that hides its amount by default.
 * Front face (private): name, allocation %, and — if a goal is set —
 * progress toward target as a %. The amount lives on the back.
 *
 * Two ways to reveal:
 *  - The global "Show values" toggle (the `revealed` prop) flips every card.
 *  - Tapping THIS card's coloured chip / eye flips just this one.
 */
export default function FlipBahashaCard({ bahasha: b, revealed, expanded, onToggleExpand, onWithdraw, txns, txnIcon }) {
  const [self, setSelf] = useState(revealed);
  // Keep in sync when the global toggle changes
  useEffect(() => { setSelf(revealed); }, [revealed]);

  const flip = (e) => { e.stopPropagation(); setSelf(v => !v); };

  const hasGoal = !!b.goalAmount;
  const goalPct = hasGoal ? Math.min(100, Math.round((b.balance / b.goalAmount) * 100)) : null;
  const reached = hasGoal && b.balance >= b.goalAmount;
  // Every bar shows a fill: goal bahashas → progress to target; others → their allocation share
  const barPct = hasGoal ? goalPct : b.percentage;
  const barLabel = hasGoal ? (reached ? '✓' : `${goalPct}%`) : `${b.percentage}%`;
  const barCaption = hasGoal ? (reached ? `Target reached — ${b.goalName} 🎉` : `to reach ${b.goalName}`) : 'of each deposit';
  const barColor = reached ? '#16A34A' : b.color;
  // No-target bahashas stay minimal (name + %); only goal bahashas get the bar
  const faceH = hasGoal ? 'h-[88px]' : 'h-[60px]';
  const faceBase = `absolute inset-0 flex items-center gap-2.5 px-4 ${faceH}`;

  const Chevron = () => (
    <button onClick={(e) => { e.stopPropagation(); onToggleExpand(); }} aria-label={expanded ? 'Collapse' : 'Expand details'}
      className="shrink-0 p-1 -mr-1 text-gray-300 hover:text-gray-500">
      <svg className={`w-4 h-4 transition ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
    </button>
  );

  return (
    <motion.div layout className="bg-surface rounded-2xl border border-gray-100 overflow-hidden">
      <div style={{ perspective: 1200 }}>
        <motion.div
          animate={{ rotateY: self ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className={`relative ${faceH}`}
        >
          {/* FRONT — private */}
          <div className={faceBase} style={{ backfaceVisibility: 'hidden' }}>
            <div className="w-2 self-stretch my-3 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
            <button onClick={onToggleExpand} className="flex-1 min-w-0 text-left" aria-label={`${b.name}, amount hidden. Expand details`}>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-dark text-sm truncate">{b.name}</h4>
                {b.isLocked && <span className="text-xs">🔒</span>}
                <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{b.percentage}%</span>
              </div>
              {hasGoal && (
                <>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${barPct}%`, backgroundColor: barColor }} />
                    </div>
                    <span className="text-[10px] font-bold tabular-nums shrink-0" style={{ color: barColor }}>{barLabel}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 truncate">{barCaption}</p>
                </>
              )}
            </button>
            {/* Tap THIS chip to flip just this bahasha */}
            <button onClick={flip} aria-label={`Show ${b.name} amount`}
              className="shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1.5 active:scale-95 transition"
              style={{ background: `linear-gradient(135deg, ${b.color}22, ${b.color}11)` }}>
              <span className="font-black tracking-widest text-sm" style={{ color: b.color }}>••••</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={b.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
            <Chevron />
          </div>

          {/* BACK — revealed amount */}
          <div className={faceBase} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="w-2 self-stretch my-3 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
            <button onClick={onToggleExpand} className="flex-1 min-w-0 text-left" aria-label={`${b.name}, ${formatTZS(b.balance)}. Expand details`}>
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
            </button>
            {/* Tap to hide this bahasha again */}
            <button onClick={flip} aria-label={`Hide ${b.name} amount`}
              className="shrink-0 p-1.5 rounded-lg active:scale-95 transition" style={{ background: `${b.color}14` }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={b.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            <Chevron />
          </div>
        </motion.div>
      </div>

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
