import React from "react";
import { Input } from "@/components/ui/input";

export default function GoalFields({ enabled, onToggle, name, onName, amount, onAmount, existingGoal }) {
  return <div className="rounded-xl border p-4">
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium"><input type="checkbox" checked={enabled} onChange={(event) => onToggle(event.target.checked)} className="h-4 w-4 accent-primary" />{existingGoal ? "Update savings target" : "Add a savings target (optional)"}</label>
    {enabled ? <div className="mt-3 space-y-4">
      <label className="block text-sm font-medium">Target name<Input className="mt-1 min-h-11" value={name} onChange={(event) => onName(event.target.value)} placeholder="School fees" maxLength={100} required /></label>
      <label className="block text-sm font-medium">Target amount (TZS)<Input className="mt-1 min-h-11" type="number" inputMode="numeric" min="1" step="1" max={Number.MAX_SAFE_INTEGER} value={amount} onChange={(event) => onAmount(event.target.value)} placeholder="500000" required /></label>
    </div> : existingGoal ? <p className="mt-2 text-xs text-muted-foreground">Your existing savings target will stay unchanged.</p> : <p className="mt-2 text-xs text-muted-foreground">You can add a target later.</p>}
  </div>;
}