import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import SendSource from "@/components/dusco/send/SendSource";
import SendDestination from "@/components/dusco/send/SendDestination";
import SendFeePreview from "@/components/dusco/send/SendFeePreview";
import useSendFee from "@/components/dusco/send/useSendFee";
import { sourceError, destinationError } from "@/components/dusco/send/sendMoneyRules";

export default function SendMoneyForm({ wallets, form, onChange, onReview }) {
  const [error, setError] = useState("");
  const wallet = wallets.find((item) => String(item.id) === form.bahashaId);
  const amount = Number(form.amount);
  const problem = sourceError(wallet, amount);
  const preview = useSendFee(wallet, amount);
  const change = (next) => { setError(""); onChange(next); };
  const submit = (event) => {
    event.preventDefault();
    const validation = problem || destinationError(form);
    if (validation) return setError(validation);
    if (!preview.ready) return setError("Wait for a confirmed fee preview before continuing.");
    if (amount <= preview.quote.fee) return setError("Your amount must be larger than the fee.");
    onReview({ walletName: wallet.name, destinationType: form.destinationType, quote: preview.quote, body: { bahashaId: wallet.id, amount, destinationPhone: form.destinationPhone.replace(/\s/g, ""), destinationNetwork: form.destinationNetwork } });
  };
  return <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
    <div><h2 className="font-display text-xl font-semibold">Where should your money go?</h2><p className="mt-2 text-sm text-muted-foreground">Choose one bahasha, then add your recipient’s details.</p></div>
    <SendSource wallets={wallets} wallet={wallet} form={form} onChange={change} />
    {wallet && form.amount && !wallet.isLocked && problem && <p role="alert" className="text-sm text-destructive">{problem}</p>}
    <SendDestination form={form} onChange={change} />
    {!problem && <SendFeePreview amount={amount} preview={preview} />}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" className="min-h-12 w-full" disabled={!preview.ready || amount <= Number(preview.quote?.fee)}>Review transfer</Button>
  </form>;
}