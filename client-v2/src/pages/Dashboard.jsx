import React from "react";
import { Link } from "react-router-dom";
import { RefreshCw, ArrowRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import { api } from "@/lib/duscoApi";
import { Button } from "@/components/ui/button";
import DashboardGreeting from "@/components/dusco/DashboardGreeting";
import DashboardWallets from "@/components/dusco/DashboardWallets";
import TransactionRows from "@/components/dusco/TransactionRows";
import DividendsSection from "@/components/dusco/DividendsSection";
import QueryFeedback from "@/components/dusco/QueryFeedback";

export default function Dashboard() {
  const { user } = useDuscoAuth();
  const client = useQueryClient();
  const prefix = ["dusco", user?.id];
  const profile = useQuery({ queryKey: [...prefix, "profile"], queryFn: () => api.me(), retry: false, staleTime: 60000 });
  const wallets = useQuery({ queryKey: [...prefix, "wallets"], queryFn: () => api.getWallets(), retry: false, staleTime: 15000 });
  const activity = useQuery({ queryKey: [...prefix, "transactions", { limit: 5, offset: 0 }], queryFn: () => api.getTransactions({ limit: 5, offset: 0 }), retry: false, staleTime: 15000 });
  const refreshing = profile.isFetching || wallets.isFetching || activity.isFetching;
  return <div className="space-y-7">
    <div className="flex items-center justify-between gap-3"><p className="rounded-full bg-dusco-gold-soft px-3 py-1.5 text-xs font-medium text-foreground">Demo · No real funds</p><Button variant="ghost" size="icon" className="h-11 w-11" disabled={refreshing} aria-label="Refresh dashboard" onClick={() => client.invalidateQueries({ queryKey: prefix })}><RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /></Button></div>
    <DashboardGreeting user={profile.data || user} />
    {profile.isError && <QueryFeedback error={profile.error} onRetry={profile.refetch} />}
    {wallets.isPending ? <QueryFeedback /> : wallets.isError ? <QueryFeedback error={wallets.error} onRetry={wallets.refetch} /> : <DashboardWallets wallets={wallets.data} />}
    <DividendsSection />
    <section id="activity" className="scroll-mt-24">
      <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-display text-xl font-semibold">Recent activity</h2><Link to="/app/transactions" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary">View all <ArrowRight className="h-4 w-4" /></Link></div>
      {activity.isPending ? <QueryFeedback label="Loading recent activity…" /> : activity.isError ? <QueryFeedback error={activity.error} onRetry={activity.refetch} /> : <TransactionRows transactions={activity.data?.transactions || []} />}
    </section>
    <p className="pb-2 text-center text-xs text-muted-foreground">All money movement in this demo is simulated.</p>
  </div>;
}