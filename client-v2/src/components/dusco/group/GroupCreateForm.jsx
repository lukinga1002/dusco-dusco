import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BahashaDialog from "@/components/dusco/bahasha/BahashaDialog";
import GroupBahashaEditor from "@/components/dusco/group/GroupBahashaEditor";
import GroupInvitePhones from "@/components/dusco/group/GroupInvitePhones";
import { GROUP_FREQUENCIES, GROUP_NETWORKS, sumPercent } from "@/components/dusco/group/groupRules";
import { api } from "@/lib/duscoApi";

const initialForm = { name: "", description: "", contributionFrequency: "weekly", contributionSharesAmount: "", contributionSocialAmount: "" };

export default function GroupCreateForm({ onClose }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [bahashas, setBahashas] = useState([{ name: "", percentage: "", hasGoal: false, goalName: "", goalAmount: "" }, { name: "", percentage: "", hasGoal: false, goalName: "", goalAmount: "" }]);
  const [phones, setPhones] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const total = sumPercent(bahashas);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Give your group a name.");
    const shares = Number(form.contributionSharesAmount);
    const social = Number(form.contributionSocialAmount);
    if (!Number.isInteger(shares) || shares <= 0) return setError("Shares contribution must be a positive whole amount.");
    if (!Number.isInteger(social) || social <= 0) return setError("Social fund contribution must be a positive whole amount.");
    const cleanBahashas = bahashas.map((item) => ({ name: item.name.trim(), percentage: Number(item.percentage), ...(item.hasGoal ? { goalName: item.goalName.trim(), goalAmount: Number(item.goalAmount) } : {}) }));
    if (cleanBahashas.some((item) => !item.name)) return setError("Every group bahasha needs a name.");
    if (cleanBahashas.some((item) => !Number.isInteger(item.percentage) || item.percentage <= 0)) return setError("Every group bahasha needs a positive whole percentage.");
    if (cleanBahashas.some((item) => item.hasGoal && (!item.goalName || !item.goalAmount))) return setError("Finish or remove the savings target on each bahasha.");
    if (total !== 100) return setError("Group bahasha percentages must total exactly 100%.");
    const invitePhones = phones.map((phone) => phone.replace(/\s/g, "")).filter(Boolean);
    if (invitePhones.length !== new Set(invitePhones).size) return setError("Remove duplicate invite numbers.");
    setSaving(true);
    try {
      const result = await api.createGroup({ name: form.name.trim(), description: form.description.trim() || undefined, contributionSharesAmount: shares, contributionSocialAmount: social, contributionFrequency: form.contributionFrequency, bahashas: cleanBahashas, invitePhones });
      navigate(`/app/groups/${result.id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };
  return <BahashaDialog title="Start a kikoba" description="One number for the group, a shared ledger, and envelopes for the social fund." busy={saving} onClose={onClose}>
    <form onSubmit={submit}><fieldset disabled={saving} className="space-y-5">
      <label className="block text-sm font-medium">Group name<Input className="mt-1.5 min-h-12" placeholder="Umoja Savings Group" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength={60} required /></label>
      <label className="block text-sm font-medium">Description <span className="font-normal text-muted-foreground">(optional)</span><Input className="mt-1.5 min-h-12" placeholder="What the group is saving for" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={200} /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium">Shares per member (TZS)<Input type="number" inputMode="numeric" min="1" step="1" className="mt-1.5 min-h-12" placeholder="50000" value={form.contributionSharesAmount} onChange={(event) => setForm({ ...form, contributionSharesAmount: event.target.value })} required /></label>
        <label className="block text-sm font-medium">Social fund (TZS)<Input type="number" inputMode="numeric" min="1" step="1" className="mt-1.5 min-h-12" placeholder="10000" value={form.contributionSocialAmount} onChange={(event) => setForm({ ...form, contributionSocialAmount: event.target.value })} required /></label>
      </div>
      <label className="block text-sm font-medium">Contribution frequency
        <select className="mt-1.5 min-h-12 w-full rounded-xl border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={form.contributionFrequency} onChange={(event) => setForm({ ...form, contributionFrequency: event.target.value })}>
          {GROUP_FREQUENCIES.map((frequency) => <option key={frequency} value={frequency} className="capitalize">{frequency}</option>)}
        </select>
      </label>
      <p className="rounded-xl bg-dusco-gold-soft p-3 text-xs text-foreground">Shares track each member’s ledger. The social fund splits across the group’s bahashas by percentage — like personal deposits.</p>
      <GroupBahashaEditor bahashas={bahashas} onChange={setBahashas} />
      <GroupInvitePhones phones={phones} onChange={setPhones} />
      <p className="text-xs text-muted-foreground">Members can also receive directly on the group Dusco number from {GROUP_NETWORKS[0]} and other networks.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" className="min-h-11" onClick={onClose}>Cancel</Button><Button type="submit" className="min-h-11" disabled={total !== 100}>{saving ? "Creating…" : "Create group"}</Button></div>
    </fieldset></form>
  </BahashaDialog>;
}