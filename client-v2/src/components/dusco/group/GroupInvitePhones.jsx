import React from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isValidTzPhone } from "@/lib/duscoFormat";

export default function GroupInvitePhones({ phones, onChange }) {
  const add = () => onChange([...phones, ""]);
  const set = (index, value) => onChange(phones.map((item, i) => i === index ? value : item));
  return <div className="space-y-2">
    <p className="text-sm font-medium">Invite members <span className="font-normal text-muted-foreground">(optional)</span></p>
    {phones.map((phone, index) => <div key={index} className="flex gap-2">
      <Input type="tel" inputMode="tel" placeholder="0712345678" className="min-h-11" value={phone} onChange={(event) => set(index, event.target.value)} aria-label={`Invite phone ${index + 1}`} />
      <Button type="button" variant="ghost" size="icon" className="h-11 w-11 shrink-0" aria-label="Remove invite" onClick={() => onChange(phones.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
    </div>)}
    <Button type="button" variant="outline" className="min-h-11" onClick={add}>Add another number</Button>
    {phones.some((phone) => phone && !isValidTzPhone(phone)) && <p className="text-xs text-destructive">Each invite needs a valid Tanzanian number, e.g. 0712345678.</p>}
    <p className="text-xs text-muted-foreground">Invitees must already be registered on Dusco. You can invite more members later.</p>
  </div>;
}