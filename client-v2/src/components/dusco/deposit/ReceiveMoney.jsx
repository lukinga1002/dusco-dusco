import React from "react";
import { Copy, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

// The four steps a saver actually follows. This is the product story — money
// arrives at one number and splits itself — so it leads the Add Money screen.
function Steps({ duscoNumber }) {
  const steps = [
    "Open M-Pesa, Airtel Money, Mixx by Yas, Azam Pesa, or your bank app.",
    "Choose “Send money” to another network, or pay to a paybill.",
    <>
      Enter your Dusco number{" "}
      <span className="whitespace-nowrap font-mono font-semibold text-dusco-ink">
        {duscoNumber || "DUS-XXXXXX"}
      </span>{" "}
      as the recipient.
    </>,
    "Confirm. The money lands in Dusco and splits across your bahashas automatically.",
  ];
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-dusco-ink-soft">
        How to receive money
      </h3>
      <ol className="mt-3 space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dusco-red text-xs font-semibold text-white"
            >
              {i + 1}
            </span>
            <span className="min-w-0 text-sm leading-relaxed text-dusco-ink">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function ReceiveMoney({ user }) {
  const copy = useMutation({ mutationFn: () => navigator.clipboard.writeText(user.duscoNumber) });
  return (
    <section className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Your receiving number</h2>
        <p className="mt-2 text-sm text-muted-foreground">One Dusco number for all your bahashas.</p>
      </div>

      {user?.duscoNumber ? (
        <div className="rounded-2xl bg-accent p-5">
          <p className="break-all font-mono text-2xl font-semibold tracking-wide">{user.duscoNumber}</p>
          <Button
            variant="outline"
            className="mt-4 min-h-11 gap-2"
            disabled={copy.isPending}
            onClick={() => copy.mutate()}
          >
            {copy.isSuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copy.isSuccess ? "Copied" : "Copy number"}
          </Button>
          {copy.isError && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              Copy is unavailable. Select and copy the number above.
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Your receiving number is not available yet. Refresh your account details to load it.
        </p>
      )}

      <Steps duscoNumber={user?.duscoNumber} />

      <p className="text-sm text-muted-foreground">
        You do not need to open Dusco first. Incoming deposits are split automatically according to
        your saved percentages, after any network fee.
      </p>

      <p className="rounded-xl bg-dusco-gold-soft p-4 text-sm text-foreground">
        <strong>Demo only:</strong> this number is not a live payment destination. Do not send real
        money from a mobile wallet or bank; use Simulate deposit to try the flow.
      </p>
    </section>
  );
}
