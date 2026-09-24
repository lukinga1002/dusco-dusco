import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/duscoApi";
import { formatTZS } from "@/lib/duscoFormat";
import BahashaDialog from "@/components/dusco/bahasha/BahashaDialog";
import useBahashaMutation from "@/components/dusco/bahasha/useBahashaMutation";

export default function DeleteBahashaForm({ wallet, wallets, onClose, onSaved }) {
  const [destination, setDestination] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const hasBalance = Number(wallet.balance) > 0;
  const recipients = wallets.filter((item) => item.id !== wallet.id);
  const blocked = wallets.length <= 2 || Boolean(wallet.isLocked);
  const save = useBahashaMutation((body) => api.deleteWallet(wallet.id, body), onSaved, "Bahasha deleted; any remaining balance was transferred to your chosen bahasha.");
  const submit = (event) => {
    event.preventDefault(); setError("");
    if (blocked) return setError("Keep at least two bahashas, and unlock this bahasha before deleting it.");
    if (hasBalance && !recipients.some((item) => item.id === destination)) return setError("Choose where to transfer the remaining balance.");
    if (!accepted) return setError("Confirm deletion before continuing.");
    save.mutate(hasBalance ? { transferToId: destination } : {});
  };
  return <BahashaDialog title={`Delete ${wallet.name}?`} description="This permanently removes the bahasha. Your remaining savings must stay in another envelope." busy={save.isPending} onClose={onClose}>
    <form onSubmit={submit}><fieldset disabled={save.isPending} className="space-y-4">
      <p className="rounded-xl bg-muted p-4 text-sm">{hasBalance ? `Remaining balance: ${formatTZS(wallet.balance)}. It will be moved before this bahasha is deleted.` : "This bahasha has no remaining balance to move."}</p>
      {hasBalance && <label className="block text-sm font-medium">Transfer balance to<select className="mt-1 min-h-11 w-full rounded-md border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={destination} onChange={(event) => setDestination(event.target.value)} required><option value="">Choose a bahasha</option>{recipients.map((item) => <option key={item.id} value={item.id}>{item.name}{item.isLocked ? " (locked)" : ""}</option>)}</select></label>}
      <p className="text-xs text-muted-foreground">Keep at least two bahashas. You may need to rebalance your deposit percentages afterward.</p>
      <label className="flex min-h-11 items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-primary" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} required /><span>I understand that deleting this bahasha cannot be undone.</span></label>
      {(error || save.isError || blocked) && <p role="alert" className="text-sm text-destructive">{error || save.error?.message || "Keep at least two bahashas, and unlock before deleting."}</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" className="min-h-11" onClick={onClose}>Cancel</Button><Button type="submit" variant="destructive" className="min-h-11" disabled={blocked || !accepted || (hasBalance && !destination)}>{save.isPending ? "Deleting…" : "Delete bahasha"}</Button></div>
    </fieldset></form>
  </BahashaDialog>;
}