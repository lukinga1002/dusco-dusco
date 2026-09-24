import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import QueryFeedback from "@/components/dusco/QueryFeedback";
import { canDeposit } from "@/components/dusco/deposit/depositMath";
import DepositForm from "@/components/dusco/deposit/DepositForm";
import DepositReview from "@/components/dusco/deposit/DepositReview";
import DepositReceipt from "@/components/dusco/deposit/DepositReceipt";

export default function DepositFlow({ wallets, operation, loadError, onRetry }) {
  const [form, setForm] = useState({ amount: "", network: "", phone: "" });
  const [review, setReview] = useState(null);
  const reset = () => { operation.reset(); setReview(null); setForm({ amount: "", network: "", phone: "" }); };
  if (operation.isSuccess) return <DepositReceipt result={operation.data} onAnother={reset} />;
  if (review) return <DepositReview review={review} operation={operation} onEdit={() => { operation.reset(); setReview(null); }} />;
  if (loadError) return <QueryFeedback error={loadError} onRetry={onRetry} />;
  if (!canDeposit(wallets)) return <section className="space-y-4 rounded-2xl border bg-card p-6"><h2 className="font-display text-xl font-semibold">Set up your deposit split first</h2><p className="text-sm text-muted-foreground">You need 2–6 bahashas with allocations totaling exactly 100% before money can split automatically.</p><Button asChild className="min-h-11"><Link to="/app/bahashas">Manage bahashas</Link></Button></section>;
  return <DepositForm wallets={wallets} form={form} onChange={setForm} onReview={(next) => { operation.reset(); setReview(next); }} />;
}