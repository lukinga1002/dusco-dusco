import React from "react";
import { Users } from "lucide-react";
import PrivacyBalance from "@/components/dusco/PrivacyBalance";
import { formatDate, maskPhone } from "@/lib/duscoFormat";
import { ROLE_LABELS } from "@/components/dusco/group/groupRules";

export default function GroupMembers({ members }) {
  if (!members.length) return <p className="rounded-2xl border border-dashed bg-card px-5 py-8 text-center text-sm text-muted-foreground">No members yet. Invite registered Dusco users to build your ledger.</p>;
  return <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
    {members.map((member) => <li key={member.id} className="flex items-start gap-3 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dusco-gold-soft text-foreground"><Users className="h-4 w-4" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
          <p className="text-sm font-semibold">{member.name || "Member"} <span className="ml-1 text-xs font-normal text-muted-foreground">· {ROLE_LABELS[member.role] || member.role}</span></p>
          <div className="text-right"><p className="text-xs text-muted-foreground">Shares</p><PrivacyBalance amount={member.sharesTotal} className="text-sm font-semibold" /></div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{maskPhone(member.phone)}{member.lastContribution ? ` · Last contribution ${formatDate(member.lastContribution)}` : " · No contributions yet"}</p>
      </div>
    </li>)}
  </ul>;
}