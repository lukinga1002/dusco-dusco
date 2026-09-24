import React from "react";
import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import { api } from "@/lib/duscoApi";
import StatGrid from "@/components/dusco/StatGrid";
import { formatTZS, formatDate } from "@/lib/duscoFormat";

// Dividends are always presented as illustrative/projection — never guaranteed.
export default function DividendsSection() {
  const { user } = useDuscoAuth();
  const prefix = ["dusco", user?.id];
  const projection = useQuery({ queryKey: [...prefix, "dividends-projection"], queryFn: () => api.dividendProjection(), retry: false, staleTime: 60000 });
  const history = useQuery({ queryKey: [...prefix, "dividends-history"], queryFn: () => api.dividendHistory(), retry: false, staleTime: 60000 });
  const format = (key, value) => {
    if (/rate|yield|percent/i.test(key)) {
      // The API already returns some rates pre-formatted (e.g. "8%") — pass those
      // straight through instead of coercing them to NaN.
      if (typeof value === "string" && value.trim().endsWith("%")) return value.trim();
      const n = Number(value);
      if (!Number.isFinite(n)) return String(value);
      return `${n >= 0 && n <= 1 ? n * 100 : n}%`;
    }
    // `return` is matched after the rate branch above, so annualReturnRate
    // ("8%") is still handled as a percentage rather than a currency amount.
    if (/amount|balance|dividend|earning|projected|return|payout/i.test(key)) {
      const n = Number(value);
      return Number.isFinite(n) ? formatTZS(n) : String(value);
    }
    if (/date|period|since|at$/i.test(key)) return formatDate(value);
    return String(value);
  };
  return <section className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-display text-xl font-semibold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-dusco-green" />Dividends</h2>
      <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">Illustrative · not guaranteed</span>
    </div>
    {(projection.isError || history.isError) ? (
      <p className="rounded-2xl border border-dashed bg-card px-5 py-6 text-center text-sm text-muted-foreground">Dividend information isn’t available right now. Try refreshing in a moment.</p>
    ) : <>
      <div className="rounded-2xl border bg-card p-5 space-y-4">
        {projection.isPending ? <p role="status" className="text-sm text-muted-foreground">Loading your projection…</p> : <>
          <StatGrid data={stripNested(projection.data)} formatValue={format} />
          <p className="text-xs text-muted-foreground">Projected figures show how dividends could grow. They depend on platform performance and are never guaranteed returns.</p>
        </>}
        {history.data?.totalEarned !== undefined && <div className="rounded-xl bg-dusco-green-soft p-4 flex items-center justify-between"><p className="text-sm text-dusco-green font-medium">Dividends earned so far</p><p className="font-display text-lg font-semibold text-dusco-green tabular-nums">{formatTZS(history.data.totalEarned)}</p></div>}
        {Array.isArray(history.data?.dividends) && history.data.dividends.length > 0 && <ul className="divide-y rounded-xl border">{history.data.dividends.slice(0, 5).map((item) => <li key={item.id} className="flex flex-wrap justify-between gap-2 p-3 text-sm">
          <span className="font-medium">{item.bahashaName || "Bahasha"} · {formatTZS(item.amount)}</span>
          <span className="text-muted-foreground text-xs">{item.periodStart || item.periodEnd ? `${formatDate(item.periodStart)} – ${formatDate(item.periodEnd)}` : ""}{item.creditedAt ? ` · Credited ${formatDate(item.creditedAt)}` : ""}</span>
        </li>)}</ul>}
      </div>
    </>}
  </section>;
}

function stripNested(data) {
  if (!data || typeof data !== "object") return {};
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "number" || typeof value === "string") out[key] = value;
  }
  return out;
}