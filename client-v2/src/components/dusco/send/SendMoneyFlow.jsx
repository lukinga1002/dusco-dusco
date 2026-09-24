import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import QueryFeedback from "@/components/dusco/QueryFeedback";
import SendMoneyForm from "@/components/dusco/send/SendMoneyForm";
import SendReview from "@/components/dusco/send/SendReview";
import SendReceipt from "@/components/dusco/send/SendReceipt";
import useSendMoney from "@/components/dusco/send/useSendMoney";

const emptyForm = { bahashaId: "", amount: "", destinationType: "mobile", destinationNetwork: "", destinationPhone: "" };

export default function SendMoneyFlow({ wallets, loadError, onRetry }) {
  const [form, setForm] = useState(emptyForm);
  const [review, setReview] = useState(null);
  const operation = useSendMoney();
  const reset = () => { operation.reset(); setReview(null); setForm(emptyForm); };
  if (operation.isSuccess) return <SendReceipt result={operation.data} review={review} onAnother={reset} />;
  if (review) return <SendReview review={review} operation={operation} onEdit={() => { operation.reset(); setReview(null); }} />;
  if (loadError) return <QueryFeedback error={loadError} onRetry={onRetry} />;
  if (!wallets.length) return <section className="space-y-4 rounded-2xl border bg-card p-6"><h2 className="font-display text-xl font-semibold">Create a bahasha first</h2><p className="text-sm text-muted-foreground">Set up your savings envelopes and add demo funds before sending money.</p><Button asChild className="min-h-11"><Link to="/app/bahashas">Manage bahashas</Link></Button></section>;
  return <SendMoneyForm wallets={wallets} form={form} onChange={setForm} onReview={(next) => { operation.reset(); setReview(next); }} />;
}