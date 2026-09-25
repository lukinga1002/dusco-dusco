import React from "react";
import { Link } from "react-router-dom";
import { Wallet, ShieldCheck, Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PrivacyBalance from "@/components/dusco/PrivacyBalance";
import BahashaFlipCard from "@/components/dusco/BahashaFlipCard";

export default function DashboardWallets({ wallets }) {
  const bahashas = wallets.bahashas || [];
  const allocation = bahashas.reduce((sum, item) => sum + Number(item.percentage || 0), 0);
  return <div className="space-y-7">
    <section className="relative overflow-hidden rounded-3xl border bg-card p-5 sm:p-7 shadow-sm" aria-label="Savings balance">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-dusco-gold-soft/70 blur-2xl" />
      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /><p className="text-sm font-medium text-muted-foreground">Total savings</p></div>
        <span className="rounded-full bg-dusco-sand px-2.5 py-1 text-xs font-medium text-dusco-ink-soft">{bahashas.length} {bahashas.length === 1 ? "bahasha" : "bahashas"}</span>
      </div>
      <PrivacyBalance amount={wallets.totalBalance} size="xl" />
      <p className="relative mt-4 text-xs text-muted-foreground">Hidden by default. Tap the eye to reveal your balance.</p>
      <div className="mt-5 grid grid-cols-2 gap-3"><Button asChild className="min-h-12 w-full gap-2"><Link to="/app/add-money"><Plus className="h-4 w-4" />Add Money</Link></Button><Button asChild className="min-h-12 w-full gap-2"><Link to="/app/send"><ArrowUpRight className="h-4 w-4" />Send</Link></Button></div>
    </section>
    <section id="bahashas" className="scroll-mt-24">
      <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Your bahashas</h2><Link to="/app/bahashas" className="inline-flex min-h-11 items-center text-sm font-medium text-primary">Manage bahashas</Link></div>
      {bahashas.length ? <><p className="mb-4 text-sm text-muted-foreground">Tap an envelope to reveal its balance and savings target.</p><div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-4">{bahashas.map((item) => <BahashaFlipCard key={item.id} bahasha={item} />)}</div>{Math.abs(allocation - 100) > 0.001 && <p className="mt-4 rounded-xl bg-dusco-gold-soft p-3 text-sm text-foreground">Your allocations total {allocation}%. Rebalance to 100% before adding money.</p>}</> : <div className="rounded-2xl border border-dashed bg-card p-8 text-center"><Wallet className="mx-auto mb-3 h-7 w-7 text-primary" /><h3 className="font-display text-lg">A purpose for every shilling</h3><p className="mt-2 text-sm text-muted-foreground">No bahashas yet. Open Manage bahashas to create your savings envelopes.</p></div>}
    </section>
  </div>;
}