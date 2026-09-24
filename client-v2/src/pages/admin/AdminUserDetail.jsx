import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/duscoApi";
import StatGrid from "@/components/dusco/StatGrid";
import QueryFeedback from "@/components/dusco/QueryFeedback";
import { formatTZS, formatDate, formatDateTime } from "@/lib/duscoFormat";

export default function AdminUserDetail() {
  const { id } = useParams();
  const query = useQuery({ queryKey: ["admin", "users", id], queryFn: () => api.adminUser(id), retry: false });
  const user = Array.isArray(query.data) ? query.data[0] : query.data?.user || query.data || {};
  const format = (key, value) => {
    if (/balance|amount/i.test(key)) return formatTZS(value);
    if (/date|at$/i.test(key)) return /created|joined/i.test(key) ? formatDate(value) : formatDateTime(value);
    return String(value);
  };
  return <div className="space-y-5">
    <Link to="/admin/users" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Users</Link>
    <header><h1 className="font-display text-2xl font-semibold">{user.name || "User"}</h1><p className="mt-1 text-sm text-muted-foreground">Account record</p></header>
    {query.isPending ? <QueryFeedback label="Loading user…" /> : query.isError ? <QueryFeedback error={query.error} onRetry={query.refetch} /> : <StatGrid data={user} formatValue={format} max={16} className="sm:grid-cols-3" />}
    {Array.isArray(user.bahashas) && user.bahashas.length > 0 && <section className="space-y-2">
      <h2 className="font-display text-lg font-semibold">Bahashas</h2>
      <ul className="divide-y overflow-hidden rounded-2xl border bg-card">{user.bahashas.map((item) => <li key={item.id} className="flex justify-between p-3 text-sm"><span className="font-medium">{item.name}</span><span className="tabular-nums text-muted-foreground">{item.percentage}% · {formatTZS(item.balance)}</span></li>)}</ul>
    </section>}
  </div>;
}