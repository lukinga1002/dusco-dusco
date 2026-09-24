import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/duscoApi";
import BahashaDialog from "@/components/dusco/bahasha/BahashaDialog";
import useBahashaMutation from "@/components/dusco/bahasha/useBahashaMutation";

export default function RebalanceForm({ wallets, onClose, onSaved }) {
  const [values, setValues] = useState(() => Object.fromEntries(wallets.map((wallet) => [wallet.id, String(wallet.percentage || 0)])));
  const total = wallets.reduce((sum, wallet) => sum + Number(values[wallet.id] || 0), 0);
  const valid = wallets.length >= 2 && wallets.length <= 6 && total === 100 && wallets.every((wallet) => values[wallet.id] !== undefined && values[wallet.id] !== "" && Number.isInteger(Number(values[wallet.id])) && Number(values[wallet.id]) >= 0 && Number(values[wallet.id]) <= 100);
  const save = useBahashaMutation((allocations) => api.rebalance(allocations), onSaved, "Your deposit allocations now total 100%.");
  const submit = (event) => {
    event.preventDefault();
    if (valid) save.mutate(wallets.map((wallet) => ({ id: wallet.id, percentage: Number(values[wallet.id]) })));
  };
  return <BahashaDialog title="Rebalance your bahashas" description="Divide future deposits across your envelopes. Your existing balances will not move." busy={save.isPending} onClose={onClose}>
    <form onSubmit={submit}><fieldset disabled={save.isPending} className="space-y-4">
      {wallets.map((wallet) => <label key={wallet.id} className="flex items-center justify-between gap-4 text-sm font-medium"><span className="min-w-0 break-words">{wallet.name}</span><span className="flex shrink-0 items-center gap-2"><Input type="number" inputMode="numeric" min="0" max="100" step="1" className="min-h-11 w-24" value={values[wallet.id] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [wallet.id]: event.target.value }))} required aria-label={`${wallet.name} percentage`} />%</span></label>)}
      <div role="status" className={`rounded-xl p-4 text-sm ${valid ? "bg-dusco-green-soft text-dusco-green" : "bg-dusco-gold-soft text-foreground"}`}><p className="font-semibold">Total: {total}% / 100%</p><p className="mt-1">{valid ? "Ready to save." : total < 100 ? `Assign the remaining ${100 - total}%.` : total > 100 ? `Reduce allocations by ${total - 100}%.` : "Enter a whole percentage for every bahasha."}</p></div>
      {save.isError && <p role="alert" className="text-sm text-destructive">{save.error.message}</p>}
      <div className="flex justify-end gap-2"><Button variant="outline" type="button" className="min-h-11" onClick={onClose}>Cancel</Button><Button type="submit" className="min-h-11" disabled={!valid}>{save.isPending ? "Saving…" : "Save allocations"}</Button></div>
    </fieldset></form>
  </BahashaDialog>;
}