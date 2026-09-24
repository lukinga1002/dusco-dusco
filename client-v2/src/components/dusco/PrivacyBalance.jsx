import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTZSShort } from "@/lib/duscoFormat";

// A privacy-first balance display: blurred until the user taps to reveal.
// Designed for shared spaces — the reveal feels intentional, not accidental.
export default function PrivacyBalance({ amount, className, prefix = "TZS", size = "lg" }) {
  const [revealed, setRevealed] = useState(false);
  const sizeClass = size === "xl" ? "text-4xl sm:text-5xl" : size === "lg" ? "text-3xl" : "text-2xl";
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "font-display font-semibold tracking-tight tabular-nums text-dusco-ink transition-all duration-300",
          sizeClass,
          !revealed && "select-none"
        )}
        onClick={() => setRevealed((r) => !r)}
      >
        {revealed ? (
          `${prefix} ${formatTZSShort(amount)}`
        ) : (
          <span className="blur-sm opacity-70 tracking-wider">{prefix} ••••••</span>
        )}
      </span>
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className="p-1.5 -ml-1 rounded-lg text-dusco-ink-mute hover:text-dusco-ink hover:bg-dusco-sand transition-colors"
        aria-label={revealed ? "Hide balance" : "Reveal balance"}
      >
        {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}