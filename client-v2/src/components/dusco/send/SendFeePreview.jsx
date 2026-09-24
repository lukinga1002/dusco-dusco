import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeeBreakdown from "@/components/dusco/FeeBreakdown";

export default function SendFeePreview({ amount, preview }) {
  return <section className="space-y-3" aria-live="polite">
    <h3 className="text-sm font-semibold">Live fee preview</h3>
    {preview.error ? <div role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm"><p className="text-destructive">{preview.error.message}</p><Button type="button" variant="outline" className="mt-3 min-h-11" onClick={() => preview.refetch()}>Refresh fee</Button></div> : !preview.ready ? <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Checking your fee and savings bonus…</p> : <><FeeBreakdown amount={amount} {...preview.quote} feeWaivedReason={preview.quote.feeWaivedReason || "90-day savings bonus"} />{amount <= preview.quote.fee && <p className="text-sm text-destructive">Increase the amount so the recipient receives money after the fee.</p>}</>}
    <p className="text-xs leading-relaxed text-muted-foreground">Standard withdrawal fee: 1%, minimum TZS 500 and maximum TZS 5,000. Eligible savings held for 90+ days have no withdrawal fee; Dusco confirms your eligibility above.</p>
  </section>;
}