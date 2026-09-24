import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BahashaDialog from "@/components/dusco/bahasha/BahashaDialog";
import NetworkSelect from "@/components/dusco/NetworkSelect";
import { CONTRIBUTION_TYPES, contributionTotal } from "@/components/dusco/group/groupRules";
import { api } from "@/lib/duscoApi";
import { formatTZS } from "@/lib/duscoFormat";

export default function GroupContributeForm({ group, onClose, onSaved }) {
  const [type, setType] = useState("both");
  const [network, setNetwork] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const total = contributionTotal(type, group);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!network) return setError("Choose the network this contribution comes from.");
    if (total <= 0) return setError("This group has no contribution amounts set.");
    setSaving(true);
    try {
      const result = await api.contribute(group.id, { type, sourceNetwork: network });
      onSaved(result.message || "Contribution recorded.");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };
  return <BahashaDialog title={`Contribute to ${group.name}`} description="One contribution covers your member shares, the social fund, or both." busy={saving} onClose={onClose}>
    <form onSubmit={submit}><fieldset disabled={saving} className="space-y-4">
      <fieldset className="space-y-2"><legend className="text-sm font-medium">This contribution is for</legend>
        {CONTRIBUTION_TYPES.map((item) => <label key={item.value} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 ${type === item.value ? "border-primary bg-accent" : "bg-card"}`}>
          <input type="radio" name="contribution-type" value={item.value} checked={type === item.value} className="accent-primary" onChange={() => setType(item.value)} />
          <span className="text-sm"><span className="font-medium">{item.label}</span><span className="block text-xs text-muted-foreground">{item.blurb}</span></span>
        </label>)}
      </fieldset>
      <div className="rounded-xl bg-muted p-4 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">You will contribute</span><span className="font-display text-lg font-semibold tabular-nums">{formatTZS(total)}</span></div><p className="mt-1 text-xs text-muted-foreground">Set by the group: {formatTZS(group.contributionSharesAmount)} shares + {formatTZS(group.contributionSocialAmount)} social.</p></div>
      <label className="block text-sm font-medium">Coming from
        <NetworkSelect className="mt-1.5 min-h-12 w-full rounded-xl border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={network} onChange={setNetwork} placeholder="Choose network" />
      </label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" className="min-h-11" onClick={onClose}>Cancel</Button><Button type="submit" className="min-h-11 gap-2" disabled={!network || total <= 0}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? "Recording…" : "Contribute"}</Button></div>
    </fieldset></form>
  </BahashaDialog>;
}