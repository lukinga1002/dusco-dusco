import React, { useState } from "react";
import { Plus, SlidersHorizontal, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/duscoApi";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import QueryFeedback from "@/components/dusco/QueryFeedback";
import BahashaManagementCard from "@/components/dusco/bahasha/BahashaManagementCard";
import BahashaForm from "@/components/dusco/bahasha/BahashaForm";
import RebalanceForm from "@/components/dusco/bahasha/RebalanceForm";
import LockBahashaForm from "@/components/dusco/bahasha/LockBahashaForm";
import DeleteBahashaForm from "@/components/dusco/bahasha/DeleteBahashaForm";

export default function Bahashas() {
  const { user } = useDuscoAuth();
  const [action, setAction] = useState(null);
  const [notice, setNotice] = useState("");
  const query = useQuery({ queryKey: ["dusco", user?.id, "wallets"], queryFn: () => api.getWallets(), retry: false, staleTime: 15000 });
  const wallets = query.data?.bahashas || [];
  const total = wallets.reduce((sum, wallet) => sum + Number(wallet.percentage || 0), 0);
  const open = (type, wallet) => { setNotice(""); setAction({ type, wallet }); };
  const finish = (message, fresh) => {
    setNotice(message);
    const next = fresh?.bahashas;
    const needsRebalance = next?.length >= 2 && ["create", "edit", "delete"].includes(action?.type) && (action.type === "create" || next.reduce((sum, item) => sum + Number(item.percentage || 0), 0) !== 100);
    setAction(needsRebalance ? { type: "rebalance" } : null);
  };
  const formProps = { wallets, onClose: () => setAction(null), onSaved: finish };
  return <div className="space-y-5">
    <header><h1 className="font-display text-3xl font-semibold">Your bahashas</h1><p className="mt-2 text-sm text-muted-foreground">Give every shilling a purpose. Manage 2–6 envelopes and split your deposits your way.</p></header>
    <div className="flex flex-wrap gap-2"><Button className="min-h-11 gap-2" disabled={query.isPending || query.isError || wallets.length >= 6} onClick={() => open("create")}><Plus className="h-4 w-4" />Create bahasha</Button><Button variant="outline" className="min-h-11 gap-2" disabled={query.isPending || query.isError || wallets.length < 2} onClick={() => open("rebalance")}><SlidersHorizontal className="h-4 w-4" />Rebalance</Button></div>
    {notice && <p role="status" className="rounded-xl bg-dusco-green-soft p-4 text-sm text-dusco-green">{notice}</p>}
    {query.isPending ? <QueryFeedback label="Loading your bahashas…" /> : query.isError ? <QueryFeedback error={query.error} onRetry={query.refetch} /> : <>
      <div className="rounded-2xl border bg-card p-4"><div className="flex flex-wrap justify-between gap-2 text-sm font-semibold"><p>{wallets.length} / 6 bahashas</p><p>Allocated: {total}% / 100%</p></div><p className="mt-2 text-xs text-muted-foreground">{wallets.length < 2 ? "Create at least two bahashas, then allocate exactly 100% before adding money." : total !== 100 ? "Your split needs attention. Use Rebalance to allocate exactly 100% before adding money." : "Your deposit split is ready. Tap a card to reveal its private balance."}{wallets.length >= 6 ? " You have reached the six-bahasha limit." : ""}</p></div>
      {wallets.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{wallets.map((wallet) => <BahashaManagementCard key={wallet.id} wallet={wallet} count={wallets.length} onAction={open} />)}</div> : <div className="rounded-2xl border border-dashed bg-card px-6 py-10 text-center"><Wallet className="mx-auto mb-3 h-8 w-8 text-primary" /><h2 className="font-display text-xl">Start with what matters</h2><p className="mt-2 text-sm text-muted-foreground">Create your first bahasha for savings, school fees, or a future plan.</p><Button variant="outline" className="mt-4 min-h-11" onClick={() => open("create")}>Create your first bahasha</Button></div>}
    </>}
    {action?.type === "create" && <BahashaForm {...formProps} />}
    {action?.type === "edit" && <BahashaForm {...formProps} wallet={action.wallet} />}
    {action?.type === "rebalance" && <RebalanceForm {...formProps} />}
    {action?.type === "lock" && <LockBahashaForm {...formProps} wallet={action.wallet} />}
    {action?.type === "delete" && <DeleteBahashaForm {...formProps} wallet={action.wallet} />}
  </div>;
}