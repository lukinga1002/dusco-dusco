import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/duscoApi";
import StatGrid from "@/components/dusco/StatGrid";
import QueryFeedback from "@/components/dusco/QueryFeedback";
import { formatTZS, formatDateTime } from "@/lib/duscoFormat";

export default function AdminDashboard() {
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState("");
  const query = useQuery({ queryKey: ["admin", "dashboard"], queryFn: () => api.adminDashboard(), retry: false, staleTime: 30000 });
  const distribute = useMutation({
    mutationFn: () => api.adminDistributeDividends({}),
    onSuccess: (data) => { setResult(data.message || "Dividend distribution completed."); setConfirming(false); },
  });
  const format = (key, value) => {
    if (/rate|yield|percent/i.test(key)) return `${Number(value) >= 0 && Number(value) <= 1 ? Number(value) * 100 : Number(value)}%`;
    if (/balance|amount|deposit|total.*tzs|volume/i.test(key)) return formatTZS(value);
    if (/date|at$/i.test(key)) return formatDateTime(value);
    return String(value);
  };
  return <div className="space-y-6">
    <header><h1 className="font-display text-2xl font-semibold">Platform overview</h1><p className="mt-1 text-sm text-muted-foreground">Demo totals across the platform.</p></header>
    {query.isPending ? <QueryFeedback label="Loading platform totals…" /> : query.isError ? <QueryFeedback error={query.error} onRetry={query.refetch} /> : <StatGrid data={query.data} formatValue={format} max={12} className="sm:grid-cols-3" />}
    <section className="space-y-3 rounded-2xl border bg-card p-5">
      <h2 className="font-display text-lg font-semibold">Distribute dividends</h2>
      <p className="text-sm text-muted-foreground">Credits a dividend round to eligible savers. This is a demo action — all money is simulated.</p>
      {result ? <p role="status" className="rounded-xl bg-dusco-green-soft p-3 text-sm text-dusco-green">{result}</p> : confirming ? <div className="space-y-3 rounded-xl bg-destructive/10 p-4">
        <p className="text-sm">Confirm the dividend distribution for this period?</p>
        {distribute.isError && <p role="alert" className="text-sm text-destructive">{distribute.error.message}</p>}
        <div className="flex gap-2"><Button variant="outline" className="min-h-11" disabled={distribute.isPending} onClick={() => setConfirming(false)}>Cancel</Button><Button className="min-h-11 gap-2" disabled={distribute.isPending} onClick={() => distribute.mutate()}>{distribute.isPending && <Loader2 className="h-4 w-4 animate-spin" />}{distribute.isPending ? "Distributing…" : "Confirm distribution"}</Button></div>
      </div> : <Button className="min-h-11" onClick={() => setConfirming(true)}>Distribute dividends</Button>}
    </section>
    <div className="flex flex-wrap gap-2"><Button asChild variant="outline" className="min-h-11"><Link to="/admin/users">Manage users</Link></Button><Button asChild variant="outline" className="min-h-11"><Link to="/admin/transactions">Transaction log</Link></Button></div>
  </div>;
}