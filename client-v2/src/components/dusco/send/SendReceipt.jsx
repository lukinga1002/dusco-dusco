import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeeBreakdown from "@/components/dusco/FeeBreakdown";
import PrivacyBalance from "@/components/dusco/PrivacyBalance";
import { formatTZS } from "@/lib/duscoFormat";

export default function SendReceipt({ result, review, onAnother }) {
  return <section className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
    <div role="status" className="text-center"><CheckCircle2 className="mx-auto mb-3 h-9 w-9 text-dusco-green" /><h2 className="font-display text-2xl font-semibold">Demo transfer complete</h2><p className="mt-2 text-sm text-muted-foreground">Recipient receives</p><p className="mt-1 break-words font-display text-3xl font-semibold">{formatTZS(result.netSent)}</p></div>
    <FeeBreakdown amount={result.amount} fee={result.withdrawalFee} netAmount={result.netSent} feeWaived={result.feeWaived} feeWaivedReason={result.feeWaived ? review.quote.feeWaivedReason || "90-day savings bonus" : undefined} />
    <dl className="space-y-3 text-sm"><div><dt className="text-muted-foreground">Recipient</dt><dd className="mt-1 break-all font-mono">{review.body.destinationPhone}</dd><dd className="mt-1">{review.body.destinationNetwork}</dd></div><div><dt className="text-muted-foreground">From bahasha</dt><dd className="mt-1 break-words">{result.bahashaName}</dd></div>{result.transactionId && <div><dt className="text-muted-foreground">Transaction reference</dt><dd className="mt-1 break-all font-mono text-xs">{result.transactionId}</dd></div>}</dl>
    <div className="rounded-xl bg-muted p-4"><p className="mb-2 text-sm text-muted-foreground">Remaining bahasha balance</p><PrivacyBalance amount={result.remainingBalance} /></div>
    <div className="grid gap-2 sm:grid-cols-2"><Button asChild className="min-h-12"><Link to="/app">Back to dashboard</Link></Button><Button asChild variant="outline" className="min-h-12"><Link to="/app/transactions">View activity</Link></Button></div><Button variant="ghost" className="min-h-11 w-full" onClick={onAnother}>Send another transfer</Button>
    <p className="text-center text-xs text-muted-foreground">Demo only · No real funds moved</p>
  </section>;
}