import React from "react";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Receipt } from "lucide-react";
import { formatTZS, formatDateTime } from "@/lib/duscoFormat";

export default function TransactionRows({ transactions }) {
  if (!transactions.length) return <div className="rounded-2xl border border-dashed bg-card px-5 py-10 text-center"><Receipt className="mx-auto mb-3 h-7 w-7 text-muted-foreground" /><h3 className="font-display text-lg">No activity yet</h3><p className="mt-2 text-sm text-muted-foreground">Deposits, withdrawals, and fees will appear here. If you applied filters, try a wider date range.</p></div>;
  return <ul className="divide-y overflow-hidden rounded-2xl border bg-card">{transactions.map((item) => {
    const incoming = ["deposit", "dividend"].includes(item.type);
    const outgoing = ["withdrawal", "fee", "penalty"].includes(item.type);
    const Icon = incoming ? ArrowDownLeft : outgoing ? ArrowUpRight : ArrowLeftRight;
    return <li key={item.id} className="flex items-start gap-3 p-4">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${incoming ? "bg-dusco-green-soft text-dusco-green" : "bg-muted text-muted-foreground"}`}><Icon className="h-4 w-4" /></span>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-x-3 gap-y-1"><p className="text-sm font-semibold capitalize">{item.type}{item.bahashaName ? ` · ${item.bahashaName}` : ""}</p><p className={`text-sm font-semibold tabular-nums ${incoming ? "text-dusco-green" : "text-foreground"}`}>{incoming ? "+" : outgoing ? "−" : ""}{formatTZS(Math.abs(Number(item.amount) || 0))}</p></div>
        {item.description && <p className="mt-1 break-words text-xs text-muted-foreground">{item.description}</p>}
        <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(item.createdAt)}{item.sourceNetwork ? ` · ${item.sourceNetwork}` : ""}</p>
        {Number(item.fee) > 0 && <p className="mt-1 text-xs text-muted-foreground">Fee: {formatTZS(item.fee)}</p>}
      </div>
    </li>;
  })}</ul>;
}