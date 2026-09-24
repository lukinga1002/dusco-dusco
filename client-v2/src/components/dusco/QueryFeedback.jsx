import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useColdStartMessage } from "@/components/dusco/ColdStartLoader";

export default function QueryFeedback({ error, onRetry, label = "Loading your savings…" }) {
  const slow = useColdStartMessage();
  return <div role={error ? "alert" : "status"} className="rounded-2xl border bg-card p-6 text-center">
    {error ? <AlertCircle className="mx-auto mb-3 h-6 w-6 text-destructive" /> : <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-primary" />}
    <p className="text-sm text-foreground">{error ? error.message : slow ? "Waking up secure servers…" : label}</p>
    {!error && <><p className="mt-2 text-xs text-muted-foreground">{slow ? "The first connection can take up to a minute. Please keep this page open." : "Your balances stay private until you reveal them."}</p><div aria-hidden="true" className="mt-5 grid grid-cols-2 gap-3"><div className="h-16 animate-pulse rounded-xl bg-muted" /><div className="h-16 animate-pulse rounded-xl bg-muted" /></div></>}
    {error && onRetry && <Button variant="outline" className="mt-4 min-h-11" onClick={onRetry}>Try again</Button>}
  </div>;
}