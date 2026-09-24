import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import { api } from "@/lib/duscoApi";
import QueryFeedback from "@/components/dusco/QueryFeedback";
import SendMoneyFlow from "@/components/dusco/send/SendMoneyFlow";

export default function SendMoney() {
  const { user } = useDuscoAuth();
  const wallets = useQuery({ queryKey: ["dusco", user?.id, "wallets"], queryFn: () => api.getWallets(), retry: false, staleTime: 15000 });
  return <div className="space-y-5">
    <Link to="/app" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Dashboard</Link>
    <header><h1 className="font-display text-3xl font-semibold">Send Money</h1><p className="mt-2 text-sm text-muted-foreground">Send from a bahasha, with every fee clear before you confirm.</p></header>
    <p className="rounded-xl bg-dusco-gold-soft px-4 py-3 text-sm text-foreground">Demo environment · All money movement is simulated.</p>
    {!wallets.data ? <QueryFeedback error={wallets.error} onRetry={wallets.refetch} label="Loading your bahashas…" /> : <SendMoneyFlow wallets={wallets.data.bahashas || []} loadError={wallets.error} onRetry={wallets.refetch} />}
  </div>;
}