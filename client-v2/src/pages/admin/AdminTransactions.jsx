import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/duscoApi";
import QueryFeedback from "@/components/dusco/QueryFeedback";
import { formatTZS, formatDateTime } from "@/lib/duscoFormat";

const limit = 20;

export default function AdminTransactions() {
  const [offset, setOffset] = useState(0);
  const query = useQuery({ queryKey: ["admin", "transactions", { limit, offset }], queryFn: () => api.adminTransactions({ limit, offset }), retry: false, placeholderData: keepPreviousData });
  const total = Number(query.data?.total) || 0;
  const rows = Array.isArray(query.data) ? query.data : query.data?.transactions || [];
  return <div className="space-y-4">
    <header><h1 className="font-display text-2xl font-semibold">Transaction log</h1><p className="mt-1 text-sm text-muted-foreground">Every demo transaction on the platform.</p></header>
    {query.isPending ? <QueryFeedback label="Loading transactions…" /> : query.isError ? <QueryFeedback error={query.error} onRetry={query.refetch} /> : <>
      <p className="text-xs text-muted-foreground" aria-live="polite">{total ? `${offset + 1}–${Math.min(offset + rows.length, total)} of ${total}` : "No transactions yet"}</p>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="p-3">User</th><th className="p-3">Bahasha</th><th className="p-3">Type</th><th className="p-3 text-right">Amount</th><th className="p-3 text-right">Fee</th><th className="p-3">Date</th></tr></thead>
          <tbody>{rows.map((item) => <tr key={item.id} className="border-b last:border-0">
            <td className="p-3">{item.userName || item.user || "—"}</td>
            <td className="p-3">{item.bahashaName || "—"}</td>
            <td className="p-3 capitalize">{item.type || "—"}</td>
            <td className="p-3 text-right tabular-nums">{formatTZS(item.amount)}</td>
            <td className="p-3 text-right tabular-nums">{Number(item.fee) > 0 ? formatTZS(item.fee) : "—"}</td>
            <td className="p-3">{formatDateTime(item.createdAt)}</td>
          </tr>)}</tbody>
        </table>
      </div>
      {total > limit && <nav className="flex items-center justify-between gap-3" aria-label="Transaction pages">
        <Button variant="outline" className="min-h-11 gap-1" disabled={!offset || query.isFetching} onClick={() => setOffset((value) => Math.max(0, value - limit))}><ChevronLeft className="h-4 w-4" />Previous</Button>
        <span className="text-xs text-muted-foreground">Page {Math.floor(offset / limit) + 1}</span>
        <Button variant="outline" className="min-h-11 gap-1" disabled={offset + limit >= total || query.isFetching} onClick={() => setOffset((value) => value + limit)}>Next<ChevronRight className="h-4 w-4" /></Button>
      </nav>}
    </>}
    <p className="text-center text-xs text-muted-foreground">Demo transactions only</p>
  </div>;
}