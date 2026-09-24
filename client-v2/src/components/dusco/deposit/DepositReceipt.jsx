import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeeBreakdown from "@/components/dusco/FeeBreakdown";
import SplitAnimation from "@/components/dusco/SplitAnimation";

export default function DepositReceipt({ result, onAnother }) {
  return <section className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
    <div role="status" className="text-center"><CheckCircle2 className="mx-auto mb-3 h-9 w-9 text-dusco-green" /><h2 className="font-display text-2xl font-semibold">Demo deposit complete</h2><p className="mt-2 text-sm text-muted-foreground">Your money has been split into your bahashas.</p></div>
    <FeeBreakdown amount={result.grossAmount} fee={result.crossNetworkFee} netAmount={result.netAmount} amountLabel="Amount received" recipientLabel="Added to your bahashas" />
    <SplitAnimation splits={result.splits} gross={result.grossAmount} net={result.netAmount} />
    <dl className="space-y-2 text-xs text-muted-foreground"><div className="flex flex-wrap justify-between gap-2"><dt>Source network</dt><dd>{result.sourceNetwork}</dd></div>{result.transactionId && <div className="flex flex-wrap justify-between gap-2"><dt>Transaction reference</dt><dd className="break-all font-mono">{result.transactionId}</dd></div>}</dl>
    <div className="grid gap-2 sm:grid-cols-2"><Button asChild className="min-h-12"><Link to="/app">Back to dashboard</Link></Button><Button asChild variant="outline" className="min-h-12"><Link to="/app/transactions">View activity</Link></Button></div>
    <Button variant="ghost" className="min-h-11 w-full" onClick={onAnother}>Simulate another deposit</Button>
    <p className="text-center text-xs text-muted-foreground">Demo only · No real funds moved</p>
  </section>;
}