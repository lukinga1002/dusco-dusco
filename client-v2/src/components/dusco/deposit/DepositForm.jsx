import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MoneyInput from "@/components/dusco/MoneyInput";
import NetworkSelect, { NETWORKS, SETTLEMENT_NETWORK } from "@/components/dusco/NetworkSelect";
import FeeBreakdown from "@/components/dusco/FeeBreakdown";
import { isValidTzPhone } from "@/lib/duscoFormat";
import { allocationSignature, canDeposit, depositPreview } from "@/components/dusco/deposit/depositMath";

export default function DepositForm({ wallets, form, onChange, onReview }) {
  const [error, setError] = useState("");
  const amountValid = Number.isSafeInteger(Number(form.amount)) && Number(form.amount) > 0;
  const preview = amountValid && NETWORKS.includes(form.network) ? depositPreview(form.amount, form.network, wallets) : null;
  const set = (key, value) => { setError(""); onChange({ ...form, [key]: value }); };
  const submit = (event) => {
    event.preventDefault(); setError("");
    if (!amountValid) return setError("Enter a positive amount in whole Tanzanian shillings.");
    if (!preview) return setError("Choose the sender’s network.");
    if (preview.net <= 0) return setError("Your deposit must be larger than the network fee.");
    const phone = form.phone.replace(/\s/g, "");
    if (phone && !isValidTzPhone(phone)) return setError("Enter a Tanzanian phone number, such as 0712345678, or leave it blank.");
    if (!canDeposit(wallets)) return setError("Set up 2–6 bahashas with allocations totaling 100% first.");
    const body = { amount: Number(form.amount), sourceNetwork: form.network, external: true };
    if (phone) body.senderPhone = phone;
    onReview({ body, preview, signature: allocationSignature(wallets) });
  };
  return <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
    <div><h2 className="font-display text-xl font-semibold">Simulate an incoming deposit</h2><p className="mt-2 text-sm text-muted-foreground">Try adding money without charging a phone or bank account.</p></div>
    <div><label htmlFor="deposit-amount" className="mb-2 block text-sm font-medium">Amount to add (TZS)</label><MoneyInput id="deposit-amount" value={form.amount} onChange={(value) => set("amount", value)} placeholder="50,000" /></div>
    <div><label htmlFor="deposit-network" className="mb-2 block text-sm font-medium">Sender’s network</label><NetworkSelect id="deposit-network" value={form.network} onChange={(value) => set("network", value)} className="min-h-11 w-full rounded-xl border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
    <label className="block text-sm font-medium">Sender’s phone (optional)<Input type="tel" inputMode="tel" autoComplete="tel" className="mt-2 min-h-11" value={form.phone} onChange={(event) => set("phone", event.target.value)} placeholder="0712345678" maxLength={20} /></label>
    <p className="text-xs leading-relaxed text-muted-foreground">Deposits from {SETTLEMENT_NETWORK} are free. Other networks cost 1%, with a minimum fee of TZS 500, deducted from the amount you enter—not added on top.</p>
    {preview && <section aria-live="polite"><h3 className="mb-2 text-sm font-medium">Estimated fees</h3><FeeBreakdown amount={preview.gross} fee={preview.fee} netAmount={Math.max(0, preview.net)} amountLabel="Incoming amount" recipientLabel="To your bahashas" /></section>}
    {preview?.net <= 0 && <p className="text-sm text-destructive">Increase your amount so some money remains after the fee.</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" className="min-h-12 w-full">Review deposit</Button>
  </form>;
}