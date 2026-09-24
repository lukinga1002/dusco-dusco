import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/duscoApi";
import QueryFeedback from "@/components/dusco/QueryFeedback";
import { formatDate, maskPhone, formatTZS } from "@/lib/duscoFormat";

export default function AdminUsers() {
  const query = useQuery({ queryKey: ["admin", "users"], queryFn: () => api.adminUsers(), retry: false });
  const users = Array.isArray(query.data) ? query.data : query.data?.users || [];
  return <div className="space-y-4">
    <header><h1 className="font-display text-2xl font-semibold">Users</h1><p className="mt-1 text-sm text-muted-foreground">{users.length} registered user{users.length === 1 ? "" : "s"}</p></header>
    {query.isPending ? <QueryFeedback label="Loading users…" /> : query.isError ? <QueryFeedback error={query.error} onRetry={query.refetch} /> : users.length ? <div className="overflow-x-auto rounded-2xl border bg-card">
      <table className="w-full text-sm">
        <thead><tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Dusco number</th><th className="p-3">Joined</th><th className="p-3 text-right">Balance</th><th className="p-3" /></tr></thead>
        <tbody>{users.map((item) => <tr key={item.id} className="border-b last:border-0">
          <td className="p-3 font-medium">{item.name || "—"}</td>
          <td className="p-3">{maskPhone(item.phone)}</td>
          <td className="p-3 font-mono text-xs">{item.duscoNumber || "—"}</td>
          <td className="p-3">{formatDate(item.createdAt || item.joinedAt)}</td>
          <td className="p-3 text-right tabular-nums">{item.totalBalance !== undefined ? formatTZS(item.totalBalance) : "—"}</td>
          <td className="p-3 text-right"><Link className="font-medium text-primary" to={`/admin/users/${item.id}`}>View</Link></td>
        </tr>)}</tbody>
      </table>
    </div> : <p className="rounded-2xl border border-dashed bg-card px-5 py-8 text-center text-sm text-muted-foreground">No users registered yet.</p>}
  </div>;
}