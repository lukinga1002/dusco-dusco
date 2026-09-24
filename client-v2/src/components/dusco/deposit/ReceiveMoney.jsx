import React from "react";
import { Copy, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function ReceiveMoney({ user }) {
  const copy = useMutation({ mutationFn: () => navigator.clipboard.writeText(user.duscoNumber) });
  return <section className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
    <div><h2 className="font-display text-xl font-semibold">Your receiving number</h2><p className="mt-2 text-sm text-muted-foreground">One Dusco number for all your bahashas.</p></div>
    {user?.duscoNumber ? <div className="rounded-2xl bg-accent p-5"><p className="break-all font-mono text-2xl font-semibold tracking-wide">{user.duscoNumber}</p><Button variant="outline" className="mt-4 min-h-11 gap-2" disabled={copy.isPending} onClick={() => copy.mutate()}>{copy.isSuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copy.isSuccess ? "Copied" : "Copy number"}</Button>{copy.isError && <p role="alert" className="mt-2 text-sm text-destructive">Copy is unavailable. Select and copy the number above.</p>}</div> : <p className="text-sm text-muted-foreground">Your receiving number is not available yet. Refresh your account details to load it.</p>}
    <p className="text-sm text-muted-foreground">Incoming deposits are split automatically according to your saved percentages, after any network fee.</p>
    <p className="rounded-xl bg-dusco-gold-soft p-4 text-sm text-foreground"><strong>Demo only:</strong> this number is not a live payment destination. Do not send real money from a mobile wallet or bank; use Simulate deposit to try the flow.</p>
  </section>;
}