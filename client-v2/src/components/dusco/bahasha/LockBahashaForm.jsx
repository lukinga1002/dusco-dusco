import React, { useState } from "react";
import { addDays, format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/duscoApi";
import { formatDate, formatTZS } from "@/lib/duscoFormat";
import BahashaDialog from "@/components/dusco/bahasha/BahashaDialog";
import useBahashaMutation from "@/components/dusco/bahasha/useBahashaMutation";

export default function LockBahashaForm({ wallet, onClose, onSaved }) {
  const [date, setDate] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const locked = Boolean(wallet.isLocked);
  const early = locked && (!wallet.lockUntil || new Date(wallet.lockUntil).getTime() > Date.now());
  const penalty = Number(wallet.balance || 0) * 0.02;
  const save = useBahashaMutation((body) => api.updateWallet(wallet.id, body), onSaved, locked ? "Bahasha unlocked." : "Bahasha locked until your chosen date.");
  const submit = (event) => {
    event.preventDefault(); setError("");
    if (!locked && (!date || date <= format(new Date(), "yyyy-MM-dd"))) return setError("Choose a future date.");
    if (!accepted) return setError("Please confirm the lock terms before continuing.");
    save.mutate(locked ? { unlock: true } : { lockUntil: date });
  };
  return <BahashaDialog title={`${locked ? "Unlock" : "Lock"} ${wallet.name}`} description={locked ? "Review the terms before making your savings available." : "Keep this bahasha untouched until a future date."} busy={save.isPending} onClose={onClose}>
    <form onSubmit={submit}><fieldset disabled={save.isPending} className="space-y-4">
      {!locked && <label className="block text-sm font-medium">Lock until<Input type="date" className="mt-1 min-h-11" min={format(addDays(new Date(), 1), "yyyy-MM-dd")} value={date} onChange={(event) => setDate(event.target.value)} required /></label>}
      <div className="rounded-xl bg-dusco-gold-soft p-4 text-sm text-foreground">{locked ? <>{wallet.lockUntil && <p className="mb-2">Lock date: {formatDate(wallet.lockUntil)}</p>}{early ? <><p>Unlocking early costs 2% of this bahasha’s balance.</p><p className="mt-2 font-semibold">Estimated penalty: {formatTZS(penalty)}</p><p className="mt-1">Estimated remaining balance: {formatTZS(Math.max(0, Number(wallet.balance || 0) - penalty))}</p><p className="mt-2 text-xs">The final charge uses your balance at confirmation.</p></> : <p>The lock date has passed. Unlocking is free.</p>}</> : <p>Withdrawals are blocked while locked. Unlocking early costs 2% of the balance; unlocking after the lock date is free.</p>}</div>
      <label className="flex min-h-11 items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-primary" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} required /><span>{locked ? early ? "I agree to the 2% early-unlock penalty." : "I confirm that I want to unlock this bahasha." : "I understand the lock and early-unlock penalty."}</span></label>
      {(error || save.isError) && <p role="alert" className="text-sm text-destructive">{error || save.error.message}</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" className="min-h-11" onClick={onClose}>Cancel</Button><Button type="submit" className="min-h-11" disabled={!accepted}>{save.isPending ? "Saving…" : locked ? early ? "Unlock with penalty" : "Unlock for free" : "Lock bahasha"}</Button></div>
    </fieldset></form>
  </BahashaDialog>;
}