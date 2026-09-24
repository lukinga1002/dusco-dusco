import React from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GoalFields from "@/components/dusco/bahasha/GoalFields";
import { sumPercent } from "@/components/dusco/group/groupRules";

export default function GroupBahashaEditor({ bahashas, onChange }) {
  const total = sumPercent(bahashas);
  const update = (index, patch) => onChange(bahashas.map((item, i) => i === index ? { ...item, ...patch } : item));
  return <div className="space-y-3">
    <div className="flex items-center justify-between"><p className="text-sm font-medium">Group bahashas (2–6)</p><span className={`text-xs font-medium ${total === 100 ? "text-dusco-green" : "text-destructive"}`}>{total}% of 100%</span></div>
    {bahashas.map((item, index) => {
      const label = `Bahasha ${index + 1}`;
      return <fieldset key={index} className="space-y-2 rounded-xl border p-3">
        <div className="flex gap-2">
          <Input className="min-h-11" placeholder="Bahasha name" aria-label={`${label} name`} value={item.name} onChange={(event) => update(index, { name: event.target.value })} maxLength={40} />
          <div className="flex items-center gap-1"><Input type="number" min="0" max="100" aria-label={`${label} percentage`} className="min-h-11 w-20" placeholder="%" value={item.percentage} onChange={(event) => update(index, { percentage: event.target.value })} /><span className="text-sm text-muted-foreground">%</span></div>
          <Button type="button" variant="ghost" size="icon" className="h-11 w-11 shrink-0" aria-label={`Remove ${label}`} disabled={bahashas.length <= 2} onClick={() => onChange(bahashas.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
        </div>
        <GoalFields enabled={item.hasGoal} onToggle={(hasGoal) => update(index, { hasGoal })} name={item.goalName} onName={(goalName) => update(index, { goalName })} amount={item.goalAmount} onAmount={(goalAmount) => update(index, { goalAmount })} />
      </fieldset>;
    })}
    <Button type="button" variant="outline" className="min-h-11" disabled={bahashas.length >= 6} onClick={() => onChange([...bahashas, { name: "", percentage: "", hasGoal: false, goalName: "", goalAmount: "" }])}>Add bahasha</Button>
    {total !== 100 && <p className="text-xs text-destructive">Percentages must total exactly 100% to create the group.</p>}
  </div>;
}