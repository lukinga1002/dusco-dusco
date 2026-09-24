import React from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeeBreakdown from "@/components/dusco/FeeBreakdown";
import { formatTZS, maskPhone } from "@/lib/duscoFormat";

export default function DepositReview({ review, operation, onEdit }) {
  const { body, preview } = review;
  return <section className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6" aria-busy={operation.isPending}>
    <div><h2 className="font-display text-xl font-semibold">Review your demo deposit</h2><p className="mt-2 text-sm text-muted-foreground">From {body.sourceNetwork}{body.senderPhone ? ` · ${maskPhone(body.senderPhone)}` : ""}</p></div>
    <FeeBreakdown amount={preview.gross} fee={preview.fee} netAmount={preview.net} amountLabel="Incoming amount" recipientLabel="To your bahashas" />
    <div><h3 className="mb-3 text-sm font-semibold">Estimated automatic split</h3><ul className="divide-y rounded-xl border px-4">{preview.splits.map((split) => <li key={split.bahashaId} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><div className="min-w-0"><p className="break-words font-medium">{split.bahashaName}</p><p className="text-xs text-muted-foreground">{split.percentage}% of the net deposit</p></div><p className="tabular-nums">{formatTZS(split.amount)}</p></li>)}</ul></div>
    <p className="text-xs leading-relaxed text-muted-foreground">These estimates use the stated network rates and your current allocations. Rounding may differ; your receipt will show the fee and exact split confirmed by Dusco. Locked bahashas can still receive deposits.</p>
    {operation.isError && <div role="alert" className="space-y-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive"><p>{operation.error.message}</p>{operation.uncertain && <><p>We could not confirm whether this deposit completed. Do not submit it again until you have checked Activity.</p><Link to="/app/transactions" className="inline-flex min-h-11 items-center font-semibold underline">Check Activity</Link></>}</div>}
    {operation.isPending && <p role="status" className="text-sm text-muted-foreground">Checking your split and recording the deposit… This can take up to a minute; please keep this page open.</p>}
    <div className="flex flex-col-reverse gap-2 sm:flex-row"><Button variant="outline" className="min-h-12" disabled={operation.isPending || operation.uncertain} onClick={onEdit}>Edit details</Button><Button className="min-h-12 flex-1 gap-2" disabled={operation.isPending || operation.uncertain} onClick={() => operation.confirm(review)}>{operation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}{operation.isPending ? "Adding money…" : "Confirm demo deposit"}</Button></div>
    <p className="text-center text-xs text-muted-foreground">No real funds will move.</p>
  </section>;
}