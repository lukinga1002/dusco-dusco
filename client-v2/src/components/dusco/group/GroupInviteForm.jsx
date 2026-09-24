import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BahashaDialog from "@/components/dusco/bahasha/BahashaDialog";
import { api } from "@/lib/duscoApi";
import { friendlyInviteError, inviteInputError } from "@/components/dusco/group/groupRules";

export default function GroupInviteForm({ group, onClose, onSaved }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const problem = inviteInputError(phone.trim());
    if (problem) return setError(problem);
    setSaving(true);
    try {
      const result = await api.inviteMember(group.id, { phone: phone.trim().replace(/\s/g, "") });
      onSaved(result.message || "Invitation sent.");
    } catch (err) {
      setError(friendlyInviteError(err.message));
      setSaving(false);
    }
  };
  return <BahashaDialog title={`Invite to ${group.name}`} description="Invite by phone number. They must already be registered on Dusco." busy={saving} onClose={onClose}>
    <form onSubmit={submit}><fieldset disabled={saving} className="space-y-4">
      <label className="block text-sm font-medium">Member’s phone number<Input type="tel" inputMode="tel" className="mt-1.5 min-h-12" placeholder="0712345678" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={20} /></label>
      {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" className="min-h-11" onClick={onClose}>Cancel</Button><Button type="submit" className="min-h-11 gap-2">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? "Inviting…" : "Send invitation"}</Button></div>
    </fieldset></form>
  </BahashaDialog>;
}