import React from "react";
import { Pencil, Lock, Unlock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BahashaFlipCard from "@/components/dusco/BahashaFlipCard";
import { formatDate } from "@/lib/duscoFormat";

export default function BahashaManagementCard({ wallet, count, onAction }) {
  return <article className="rounded-2xl border bg-card p-3">
    <BahashaFlipCard bahasha={wallet} />
    <p className="mt-3 min-h-5 text-xs text-muted-foreground">{wallet.isLocked ? `Locked${wallet.lockUntil ? ` until ${formatDate(wallet.lockUntil)}` : ""}` : "Unlocked · Available to use"}</p>
    <div className="mt-2 grid grid-cols-3 gap-1">
      <Button variant="ghost" className="min-h-11 gap-1 px-1 text-xs" aria-label={`Edit ${wallet.name}`} onClick={() => onAction("edit", wallet)}><Pencil className="h-3.5 w-3.5" />Edit</Button>
      <Button variant="ghost" className="min-h-11 gap-1 px-1 text-xs" aria-label={`${wallet.isLocked ? "Unlock" : "Lock"} ${wallet.name}`} onClick={() => onAction("lock", wallet)}>{wallet.isLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}{wallet.isLocked ? "Unlock" : "Lock"}</Button>
      <Button variant="ghost" className="min-h-11 gap-1 px-1 text-xs text-destructive" aria-label={`Delete ${wallet.name}`} disabled={count <= 2 || Boolean(wallet.isLocked)} onClick={() => onAction("delete", wallet)}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
    </div>
    {(count <= 2 || wallet.isLocked) && <p className="mt-1 text-xs text-muted-foreground">{wallet.isLocked ? "Unlock before deleting this bahasha." : "Keep at least two bahashas; deletion is unavailable."}</p>}
  </article>;
}