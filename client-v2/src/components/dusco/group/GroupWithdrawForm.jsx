import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BahashaDialog from "@/components/dusco/bahasha/BahashaDialog";
import { api } from "@/lib/duscoApi";
import NetworkSelect from "@/components/dusco/NetworkSelect";
import MoneyInput from "@/components/dusco/MoneyInput";
import { isValidTzPhone } from "@/lib/duscoFormat";

export default function GroupWithdrawForm({ group, bahashas, onClose, onSaved }) {
  const [form, setForm] = useState({ bahashaId: "", amount: "", destinationPhone: "", destinationNetwork: "", purpose: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const wallet = bahashas.find((item) => String(item.id) === String(form.bahashaId));
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const amount = Number(form.amount);
    if (!wallet) return setError("Choose a group bahasha.");
    if (!Number.isInteger(amount) || amount <= 0) return setError("Enter a positive whole amount.");
    if (amount > Number(wallet.balance)) return setError("That bahasha does not have enough funds.");
    if (!isValidTzPhone(form.destinationPhone)) return setError("Enter a Tanzanian phone number, e.g. 0712345678.");
    if (!form.destinationNetwork) return setError("Choose the destination network.");
    setSaving(true);
    try {
      const result = await api.groupWithdraw(group.id, { bahashaId: wallet.id, amount, destinationPhone: form.destinationPhone.replace(/\s/g, ""), destinationNetwork: form.destinationNetwork, purpose: form.purpose.trim() || undefined });
      onSaved(`${result.message || "Withdrawal sent."} ${result.note || ""}`.trim(), result);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };
  return <BahashaDialog title={`Withdraw from ${group.name}`} description="Group funds go out to a member’s mobile wallet, with the fee shown after." busy={saving} onClose={onClose}>
    <form onSubmit={submit}><fieldset disabled={saving} className="space-y-4">
      <label className="block text-sm font-medium">From bahasha
        <select className="mt-1.5 min-h-12 w-full rounded-xl border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={form.bahashaId} onChange={(event) => setForm({ ...form, bahashaId: event.target.value })}>
          <option value="" disabled>Choose a group bahasha</option>
          {bahashas.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <div><div className="mb-2 flex items-center justify-between"><label className="text-sm font-medium">Amount (TZS)</label>{wallet && <Button type="button" variant="outline" className="min-h-11 text-xs" onClick={() => setForm({ ...form, amount: String(Math.floor(Number(wallet.balance))) })}>Send whole bahasha</Button>}</div><MoneyInput value={form.amount} onChange={(amount) => setForm({ ...form, amount })} placeholder="50,000" /></div>
      <label className="block text-sm font-medium">Recipient phone<Input type="tel" inputMode="tel" className="mt-1.5 min-h-12" placeholder="0712345678" value={form.destinationPhone} onChange={(event) => setForm({ ...form, destinationPhone: event.target.value })} maxLength={20} /></label>
      <label className="block text-sm font-medium">Destination network
        <NetworkSelect className="mt-1.5 min-h-12 w-full rounded-xl border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={form.destinationNetwork} onChange={(destinationNetwork) => setForm({ ...form, destinationNetwork })} placeholder="Choose network" />
      </label>
      <label className="block text-sm font-medium">Purpose <span className="font-normal text-muted-foreground">(optional)</span><Input className="mt-1.5 min-h-12" placeholder="e.g. Member loan refund" value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })} maxLength={120} /></label>
      <p className="rounded-xl bg-dusco-gold-soft p-3 text-xs text-foreground">Withdrawals use the standard fee — 1%, minimum TZS 500, maximum TZS 5,000 — taken from the amount. Every withdrawal is recorded in the group ledger.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" className="min-h-11" onClick={onClose}>Cancel</Button><Button type="submit" className="min-h-11 gap-2">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? "Sending…" : "Withdraw"}</Button></div>
      <p className="text-center text-xs text-muted-foreground">Demo environment · Simulated money only</p>
    </fieldset></form>
  </BahashaDialog>;
}