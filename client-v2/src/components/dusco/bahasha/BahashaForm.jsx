import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/duscoApi";
import BahashaDialog from "@/components/dusco/bahasha/BahashaDialog";
import GoalFields from "@/components/dusco/bahasha/GoalFields";
import useBahashaMutation from "@/components/dusco/bahasha/useBahashaMutation";

export default function BahashaForm({ wallet, wallets, onClose, onSaved }) {
  const remaining = Math.max(0, 100 - wallets.filter((item) => item.id !== wallet?.id).reduce((sum, item) => sum + Number(item.percentage || 0), 0));
  const existingGoal = Boolean(wallet?.goalName && Number(wallet?.goalAmount) > 0);
  const [name, setName] = useState(wallet?.name || "");
  const [percentage, setPercentage] = useState(String(wallet?.percentage ?? (wallets.length ? remaining : 50)));
  const [useGoal, setUseGoal] = useState(existingGoal);
  const [goalName, setGoalName] = useState(wallet?.goalName || "");
  const [goalAmount, setGoalAmount] = useState(wallet?.goalAmount ? String(wallet.goalAmount) : "");
  const [error, setError] = useState("");
  const save = useBahashaMutation((body) => wallet ? api.updateWallet(wallet.id, body) : api.createWallet(body), onSaved, wallet ? "Bahasha updated." : "Bahasha created.");
  const submit = (event) => {
    event.preventDefault(); setError("");
    if (!name.trim()) return setError("Enter a name for your bahasha.");
    if (!wallet && wallets.length >= 6) return setError("You can have up to six bahashas.");
    if (percentage === "" || !Number.isInteger(Number(percentage)) || Number(percentage) < 0 || Number(percentage) > remaining) return setError(`Choose a whole percentage from 0 to ${remaining}. Total allocations cannot exceed 100%.`);
    if (useGoal && (!goalName.trim() || !Number.isSafeInteger(Number(goalAmount)) || Number(goalAmount) <= 0)) return setError("Enter a target name and a positive whole-shilling amount.");
    const body = { name: name.trim(), percentage: Number(percentage) };
    if (useGoal) Object.assign(body, { goalName: goalName.trim(), goalAmount: Number(goalAmount) });
    save.mutate(body);
  };
  return <BahashaDialog title={wallet ? "Edit bahasha" : "Create a bahasha"} description="Give your savings a purpose and choose a share of future deposits." busy={save.isPending} onClose={onClose}>
    <form onSubmit={submit}><fieldset disabled={save.isPending} className="space-y-4">
      <label className="block text-sm font-medium">Bahasha name<Input autoFocus className="mt-1 min-h-11" value={name} onChange={(event) => setName(event.target.value)} placeholder="Akiba, Karo, Safari…" maxLength={100} required /></label>
      <label className="block text-sm font-medium">Share of every deposit (%)<Input className="mt-1 min-h-11" type="number" inputMode="numeric" min="0" max={remaining} step="1" value={percentage} onChange={(event) => setPercentage(event.target.value)} required /></label>
      <p className="text-xs text-muted-foreground">{remaining}% is available. {remaining === 0 ? "Start at 0%, then use Rebalance to give this bahasha a share." : "You can adjust all shares together with Rebalance."} Existing savings will not move.</p>
      <GoalFields enabled={useGoal} onToggle={setUseGoal} name={goalName} onName={setGoalName} amount={goalAmount} onAmount={setGoalAmount} existingGoal={existingGoal} />
      {(error || save.isError) && <p role="alert" className="text-sm text-destructive">{error || save.error.message}</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" className="min-h-11" onClick={onClose}>Cancel</Button><Button type="submit" className="min-h-11">{save.isPending ? "Saving…" : wallet ? "Save changes" : "Create bahasha"}</Button></div>
    </fieldset></form>
  </BahashaDialog>;
}