import React from "react";
import { cn } from "@/lib/utils";
import { formatTZSShort } from "@/lib/duscoFormat";

// Fee-inclusive breakdown: the fee comes OUT of the amount entered.
export default function FeeBreakdown({ amount, fee, feeWaived, feeWaivedReason, amountLabel = "Amount leaving your bahasha", recipientLabel = "Recipient receives", netAmount, className }) {
  const net = netAmount === undefined ? Math.max(0, (Number(amount) || 0) - (Number(fee) || 0)) : Number(netAmount);
  return (
    <div className={cn("rounded-2xl bg-dusco-cream border border-dusco-line p-4 space-y-2.5", className)}>
      <Row label={amountLabel} value={`TZS ${formatTZSShort(amount)}`} />
      <Row
        label="Fee"
        value={feeWaived ? "Waived" : `TZS ${formatTZSShort(fee)}`}
        valueClass={feeWaived ? "text-dusco-green font-medium" : "text-dusco-ink"}
      />
      {feeWaived && feeWaivedReason && (
        <p className="text-xs text-dusco-green bg-dusco-green-soft rounded-lg px-3 py-2 -mt-1">
          ✓ {feeWaivedReason}
        </p>
      )}
      <div className="h-px bg-dusco-line" />
      <Row
        label={recipientLabel}
        value={`TZS ${formatTZSShort(net)}`}
        bold
      />
    </div>
  );
}

function Row({ label, value, bold, valueClass }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <span className={cn("text-sm", bold ? "text-dusco-ink font-medium" : "text-dusco-ink-soft")}>{label}</span>
      <span
        className={cn(
          "tabular-nums",
          bold ? "font-display text-lg font-semibold text-dusco-ink" : "text-sm text-dusco-ink",
          valueClass
        )}
      >
        {value}
      </span>
    </div>
  );
}