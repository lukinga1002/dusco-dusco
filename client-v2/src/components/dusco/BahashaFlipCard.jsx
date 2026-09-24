import React, { useState } from "react";
import { Lock, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTZSShort } from "@/lib/duscoFormat";

// A flip card. Front: name + percentage only. Back: balance + goal progress.
// Every card has identical structure whether or not a goal is set.
export default function BahashaFlipCard({ bahasha, onFlip, className }) {
  const [flipped, setFlipped] = useState(false);
  const color = bahasha.color || "#ED1B24";
  const hasGoal = !!(bahasha.goalName && bahasha.goalAmount);
  const progress = hasGoal ? Math.min(100, Math.round((bahasha.balance / bahasha.goalAmount) * 100)) : 0;
  const remaining = hasGoal ? Math.max(0, bahasha.goalAmount - bahasha.balance) : 0;

  const toggle = () => {
    setFlipped((f) => !f);
    onFlip?.();
  };

  return (
    <div
      className={cn("relative h-40 cursor-pointer [perspective:1200px]", className)}
      onClick={toggle}
      role="button"
      tabIndex={0}
      aria-label={`${bahasha.name}, ${bahasha.percentage}% allocation. ${flipped ? "Hide" : "Reveal"} balance`}
      aria-pressed={flipped}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        {/* Front */}
        <div
          aria-hidden={flipped}
          className="absolute inset-0 [backface-visibility:hidden] rounded-2xl p-5 flex flex-col justify-between overflow-hidden"
          style={{ background: `linear-gradient(150deg, ${color} 0%, ${color}E6 60%, ${color}CC 100%)` }}
        >
          <div className="flex items-start justify-between text-white">
            <div className="min-w-0">
              <p className="text-xs/none uppercase tracking-wider opacity-80">Bahasha</p>
              <h3 className="font-display text-xl font-semibold mt-1 truncate">{bahasha.name}</h3>
            </div>
            {bahasha.isLocked && (
              <span className="shrink-0 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-white" />
              </span>
            )}
          </div>
          <div className="text-white">
            <p className="font-display text-3xl font-semibold tabular-nums">{bahasha.percentage}%</p>
            <p className="text-xs opacity-80 mt-0.5">of every deposit</p>
          </div>
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10" />
        </div>

        {/* Back */}
        <div
          aria-hidden={!flipped}
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl p-5 flex flex-col justify-between bg-white border border-dusco-line shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs/none uppercase tracking-wider text-dusco-ink-mute">Balance</p>
              <span className="w-3 h-3 rounded-full" style={{ background: color }} />
            </div>
            <p className="font-display text-base sm:text-2xl break-words font-semibold tabular-nums text-dusco-ink mt-1">
              TZS {formatTZSShort(bahasha.balance)}
            </p>
          </div>
          {hasGoal ? (
            <div>
              <div className="flex items-center gap-1.5 text-dusco-ink-soft">
                <Target className="w-3.5 h-3.5" />
                <p className="text-xs truncate">{bahasha.goalName}</p>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-dusco-sand overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${progress}%`, background: color }} />
              </div>
              <p className="text-xs text-dusco-ink-mute mt-1.5">
                {progress}% · TZS {formatTZSShort(remaining)} to reach {bahasha.goalName}
              </p>
            </div>
          ) : (
            <div className="text-xs text-dusco-ink-mute">No savings target set</div>
          )}
        </div>
      </div>
    </div>
  );
}