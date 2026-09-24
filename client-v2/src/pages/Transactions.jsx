import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import { api } from "@/lib/duscoApi";
import { Button } from "@/components/ui/button";
import ActivityFilters from "@/components/dusco/ActivityFilters";
import TransactionRows from "@/components/dusco/TransactionRows";
import QueryFeedback from "@/components/dusco/QueryFeedback";

export default function Transactions() {
  const { user } = useDuscoAuth();
  const [filters, setFilters] = useState({ type: "", bahashaId: "", startDate: "", endDate: "" });
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const invalidDates = filters.startDate && filters.endDate && filters.startDate > filters.endDate;
  const params = { ...filters, limit, offset };
  const wallets = useQuery({ queryKey: ["dusco", user?.id, "wallets"], queryFn: () => api.getWallets(), retry: false, staleTime: 15000 });
  const query = useQuery({ queryKey: ["dusco", user?.id, "transactions", params], queryFn: () => api.getTransactions(params), enabled: !invalidDates, retry: false });
  const total = Number(query.data?.total) || 0;
  const rows = query.data?.transactions || [];
  return <div className="space-y-5">
    <div><h1 className="font-display text-3xl font-semibold">Your activity</h1><p className="mt-2 text-sm text-muted-foreground">Every deposit, withdrawal, and fee, in one place.</p></div>
    <ActivityFilters value={filters} onChange={(next) => { setFilters(next); setOffset(0); }} wallets={wallets.data?.bahashas || []} walletError={wallets.error} onWalletRetry={wallets.refetch} />
    {invalidDates ? <p role="alert" className="text-sm text-destructive">The end date must be on or after the start date.</p> : query.isPending ? <QueryFeedback label="Loading your activity…" /> : query.isError ? <QueryFeedback error={query.error} onRetry={query.refetch} /> : <>
      <p className="text-xs text-muted-foreground" aria-live="polite">{total ? `${offset + 1}–${Math.min(offset + rows.length, total)} of ${total} transactions` : "No matching transactions"}</p>
      <TransactionRows transactions={rows} />
      {total > limit && <nav aria-label="Activity pages" className="flex items-center justify-between gap-3"><Button variant="outline" className="min-h-11 gap-1" disabled={!offset || query.isFetching} onClick={() => setOffset((value) => Math.max(0, value - limit))}><ChevronLeft className="h-4 w-4" />Previous</Button><span className="text-xs text-muted-foreground">Page {Math.floor(offset / limit) + 1}</span><Button variant="outline" className="min-h-11 gap-1" disabled={offset + limit >= total || query.isFetching} onClick={() => setOffset((value) => value + limit)}>Next<ChevronRight className="h-4 w-4" /></Button></nav>}
    </>}
    <p className="text-center text-xs text-muted-foreground">Demo transactions only · No real funds moved</p>
  </div>;
}