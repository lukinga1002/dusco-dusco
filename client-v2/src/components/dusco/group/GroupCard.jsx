import React from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import PrivacyBalance from "@/components/dusco/PrivacyBalance";
import { formatTZS } from "@/lib/duscoFormat";

export default function GroupCard({ group }) {
  return <Link to={`/app/groups/${group.id}`} className="block rounded-2xl border bg-card p-5 transition-colors hover:bg-accent/50">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-display text-lg font-semibold truncate">{group.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{group.duscoNumber}</p>
      </div>
      <span className="shrink-0 rounded-full bg-dusco-gold-soft px-2.5 py-1 text-xs font-medium text-foreground capitalize">{group.contributionFrequency || "weekly"}</span>
    </div>
    <div className="mt-4 flex items-end justify-between gap-3">
      <div><p className="text-xs text-muted-foreground"><Users className="mr-1 inline h-3.5 w-3.5" />{group.memberCount} member{group.memberCount === 1 ? "" : "s"}</p><p className="mt-1 text-xs text-muted-foreground">Per round: {formatTZS(group.contributionSharesAmount)} shares + {formatTZS(group.contributionSocialAmount)} social</p></div>
      <div className="text-right"><p className="text-xs text-muted-foreground">Group total</p><PrivacyBalance amount={group.totalBalance} size="sm" /></div>
    </div>
  </Link>;
}