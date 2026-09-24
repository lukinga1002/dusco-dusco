import React from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeeBreakdown from "@/components/dusco/FeeBreakdown";

export default function SendReview({ review, operation, onEdit }) {
  return <section className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6" aria-busy={operation.isPending}>
    <div><h2 className="font-display text-xl font-semibold">Review your transfer</h2><p className="mt-2 text-sm text-muted-foreground">Check the recipient carefully before confirming.</p></div>
    <dl className="space-y-3 rounded-xl bg-muted p-4 text-sm"><div><dt className="text-muted-foreground">From bahasha</dt><dd className="mt-1 break-words font-medium">{review.walletName}</dd></div><div><dt className="text-muted-foreground">To {review.destinationType === "bank" ? "bank account" : "mobile number"}</dt><dd className="mt-1 break-all font-mono text-base">{review.body.destinationPhone}</dd></div><div><dt className="text-muted-foreground">Network / bank</dt><dd className="mt-1 font-medium">{review.body.destinationNetwork}</dd></div></dl>
    <FeeBreakdown amount={review.body.amount} {...review.quote} feeWaivedReason={review.quote.feeWaivedReason || "90-day savings bonus"} />
    {operation.isError && <div role="alert" className="space-y-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{operation.uncertain ? <><p>Transfer status is unconfirmed. It may already have completed—do not send it again until you have checked Activity.</p><Link to="/app/transactions" className="inline-flex min-h-11 items-center font-semibold underline">Check Activity</Link></> : <p>{operation.error.message}</p>}</div>}
    {operation.isPending && <p role="status" className="text-sm text-muted-foreground">Checking your balance and fee, then sending… Please keep this page open.</p>}
    <div className="flex flex-col-reverse gap-2 sm:flex-row"><Button variant="outline" className="min-h-12" onClick={onEdit} disabled={operation.isPending || operation.uncertain}>Edit details</Button><Button className="min-h-12 flex-1 gap-2" disabled={operation.isPending || operation.uncertain} onClick={() => operation.confirm(review)}>{operation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}{operation.isPending ? "Sending…" : "Confirm demo transfer"}</Button></div>
    <p className="text-center text-xs text-muted-foreground">Demo only · No real funds will move</p>
  </section>;
}