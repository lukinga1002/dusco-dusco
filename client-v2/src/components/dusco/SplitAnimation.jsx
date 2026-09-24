import React, { useEffect, useState } from "react";
import { formatTZSShort } from "@/lib/duscoFormat";

// The product's signature moment: an incoming deposit splitting across envelopes.
// Uses the splits array returned by /transactions/deposit.
export default function SplitAnimation({ splits, gross, net, onComplete }) {
  const [phase, setPhase] = useState(0); // 0 incoming, 1 splitting, 2 settled

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 900);
    const t2 = setTimeout(() => setPhase(2), 2400);
    const t3 = setTimeout(() => onComplete?.(), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center py-6">
      {/* Incoming drop */}
      <div className="relative h-24 w-full flex items-center justify-center mb-6">
        <div
          className="transition-all duration-700 ease-out"
          style={{
            transform: phase >= 1 ? "translateY(60px) scale(0.6)" : "translateY(0) scale(1)",
            opacity: phase >= 1 ? 0 : 1,
          }}
        >
          <div className="px-5 py-3 rounded-2xl bg-dusco-ink text-white shadow-lg">
            <p className="text-xs opacity-70">Incoming</p>
            <p className="font-display text-xl font-semibold tabular-nums">TZS {formatTZSShort(gross)}</p>
          </div>
        </div>
        {net < gross && phase === 0 && (
          <p className="absolute bottom-0 text-xs text-dusco-ink-mute">
            net TZS {formatTZSShort(net)} after network fee
          </p>
        )}
      </div>

      {/* Envelopes filling */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {splits.map((s, i) => {
          const color = s.color || "hsl(var(--primary))";
          const filled = phase >= 1;
          return (
            <div
              key={i}
              className="rounded-2xl p-4 border transition-all duration-700 ease-out"
              style={{
                background: filled ? color : "hsl(var(--background))",
                borderColor: filled ? color : "hsl(var(--border))",
                transform: filled ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.96)",
                opacity: filled ? 1 : 0.5,
                transitionDelay: `${i * 120}ms`,
              }}
            >
              <p className="text-xs truncate" style={{ color: filled ? "rgba(255,255,255,0.85)" : "hsl(var(--muted-foreground))" }}>
                {s.bahashaName}
              </p>
              <p className="font-display text-base sm:text-lg break-words font-semibold tabular-nums mt-0.5" style={{ color: filled ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))" }}>
                TZS {formatTZSShort(s.amount)}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: filled ? "rgba(255,255,255,0.7)" : "hsl(var(--muted-foreground))" }}>
                {s.percentage}%
              </p>
            </div>
          );
        })}
      </div>

      {phase >= 2 && (
        <p className="mt-6 text-sm text-dusco-green font-medium animate-[fadeIn_0.4s_ease]">
          ✓ Split complete — your money is in its envelopes
        </p>
      )}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}