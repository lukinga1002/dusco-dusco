import React from "react";
import { cn } from "@/lib/utils";

// A clean numeric money input. Whole shillings only.
export default function MoneyInput({ value, onChange, placeholder = "0", id, className, autoFocus }) {
  return (
    <div className={cn("relative", className)}>
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dusco-ink-mute font-medium text-sm pointer-events-none">TZS</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9,]*"
        autoFocus={autoFocus}
        value={value ? Number(value).toLocaleString("en-US") : ""}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d]/g, "");
          onChange(digits ? String(parseInt(digits, 10)) : "");
        }}
        placeholder={placeholder}
        className="w-full pl-14 pr-4 py-4 rounded-2xl border border-dusco-line bg-white text-2xl font-display font-semibold tabular-nums text-dusco-ink focus:outline-none focus:border-dusco-red focus:ring-2 focus:ring-dusco-red/15 transition-all"
      />
    </div>
  );
}