import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import { api } from "@/lib/duscoApi";
import QueryFeedback from "@/components/dusco/QueryFeedback";
import ReceiveMoney from "@/components/dusco/deposit/ReceiveMoney";
import DepositFlow from "@/components/dusco/deposit/DepositFlow";
import useDeposit from "@/components/dusco/deposit/useDeposit";

export default function AddMoney() {
  const { user } = useDuscoAuth();
  const prefix = ["dusco", user?.id];
  const wallets = useQuery({ queryKey: [...prefix, "wallets"], queryFn: () => api.getWallets(), retry: false, staleTime: 15000 });
  const profile = useQuery({ queryKey: [...prefix, "profile"], queryFn: () => api.me(), retry: false, staleTime: 60000 });
  const operation = useDeposit();
  return <div className="space-y-5">
    <Link to="/app" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Dashboard</Link>
    <header><h1 className="font-display text-3xl font-semibold">Add Money</h1><p className="mt-2 text-sm text-muted-foreground">One incoming deposit. Automatically shared across your savings.</p></header>
    <p className="rounded-xl bg-dusco-gold-soft px-4 py-3 text-sm text-foreground">Demo environment · All money movement is simulated.</p>
    <Tabs defaultValue="simulate">
      <TabsList className="mb-5 grid h-auto w-full grid-cols-2"><TabsTrigger value="simulate" className="min-h-11" disabled={operation.isPending || operation.uncertain}>Simulate deposit</TabsTrigger><TabsTrigger value="receive" className="min-h-11" disabled={operation.isPending || operation.uncertain}>Receive money</TabsTrigger></TabsList>
      <TabsContent value="simulate">
        {!wallets.data ? <QueryFeedback error={wallets.error} onRetry={wallets.refetch} label="Loading your deposit split…" /> : <DepositFlow wallets={wallets.data.bahashas || []} operation={operation} loadError={wallets.error} onRetry={wallets.refetch} />}
      </TabsContent>
      <TabsContent value="receive" className="space-y-4">
        {profile.isPending && !user?.duscoNumber ? <QueryFeedback label="Loading your receiving number…" /> : <>{profile.isError && <QueryFeedback error={profile.error} onRetry={profile.refetch} />}<ReceiveMoney user={profile.data || user} /></>}
      </TabsContent>
    </Tabs>
  </div>;
}