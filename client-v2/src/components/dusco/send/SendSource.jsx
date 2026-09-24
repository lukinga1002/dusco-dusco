import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MoneyInput from "@/components/dusco/MoneyInput";

export default function SendSource({ wallets, wallet, form, onChange }) {
  return <div className="space-y-5">
    <div><label htmlFor="send-bahasha" className="mb-2 block text-sm font-medium">Send from</label><select id="send-bahasha" value={form.bahashaId} onChange={(event) => onChange({ ...form, bahashaId: event.target.value, amount: "" })} className="min-h-12 w-full rounded-xl border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option value="" disabled>Choose a bahasha</option>{wallets.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.percentage}%</option>)}</select><p className="mt-2 text-xs text-muted-foreground">Balances and savings targets stay private in this list.</p></div>
    {wallet?.isLocked && <p role="alert" className="rounded-xl bg-dusco-gold-soft p-4 text-sm">This bahasha is locked. <Link className="font-medium underline" to="/app/bahashas">Review unlock terms</Link> before sending.</p>}
    <div><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><label htmlFor="send-amount" className="text-sm font-medium">Amount leaving your bahasha (TZS)</label><Button type="button" variant="outline" className="min-h-11 text-xs" disabled={!wallet || wallet.isLocked || Number(wallet.balance) < 1} onClick={() => onChange({ ...form, amount: String(Math.floor(Number(wallet.balance))) })}>Send whole bahasha</Button></div><MoneyInput id="send-amount" value={form.amount} onChange={(amount) => onChange({ ...form, amount })} placeholder="50,000" /><p className="mt-2 text-xs text-muted-foreground">The fee comes out of this amount, not on top. Sending the whole bahasha fills in its available whole-shilling balance.</p></div>
  </div>;
}