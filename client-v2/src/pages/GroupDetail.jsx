import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/duscoApi";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import QueryFeedback from "@/components/dusco/QueryFeedback";
import TransactionRows from "@/components/dusco/TransactionRows";
import PrivacyBalance from "@/components/dusco/PrivacyBalance";
import GroupMembers from "@/components/dusco/group/GroupMembers";
import GroupContributeForm from "@/components/dusco/group/GroupContributeForm";
import GroupWithdrawForm from "@/components/dusco/group/GroupWithdrawForm";
import GroupInviteForm from "@/components/dusco/group/GroupInviteForm";
import { ROLE_LABELS, canInvite, canWithdraw, roleNotice } from "@/components/dusco/group/groupRules";
import { formatTZS } from "@/lib/duscoFormat";

export default function GroupDetail() {
  const { id } = useParams();
  const { user } = useDuscoAuth();
  const client = useQueryClient();
  const [action, setAction] = useState(null);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const query = useQuery({ queryKey: ["dusco", user?.id, "group", id], queryFn: () => api.getGroup(id), retry: false });
  const refresh = () => { setAction(null); client.invalidateQueries({ queryKey: ["dusco", user?.id, "group", id] }); client.invalidateQueries({ queryKey: ["dusco", user?.id, "groups"] }); };
  const copy = async () => { try { await navigator.clipboard.writeText(data.group.duscoNumber); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} };
  if (query.isPending) return <QueryFeedback label="Loading your group…" />;
  if (query.isError) return <QueryFeedback error={query.error} onRetry={query.refetch} />;
  const data = query.data;
  const group = data.group;
  const role = data.userRole || "member";
  const bahashas = data.bahashas || [];
  const members = data.members || [];
  return <div className="space-y-6">
    <Link to="/app/groups" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Groups</Link>
    <header className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold">{group.name}</h1>
          {group.description && <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-dusco-gold-soft px-2.5 py-1 font-mono text-xs text-foreground">{group.duscoNumber}</span>
            <Button variant="ghost" className="h-9 gap-1.5 px-2 text-xs" onClick={copy}>{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copied" : "Copy number"}</Button>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground capitalize">{group.contributionFrequency || "weekly"} · {formatTZS(group.contributionSharesAmount)} shares + {formatTZS(group.contributionSocialAmount)} social</span>
          </div>
        </div>
        <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">Your role: {ROLE_LABELS[role] || role}</span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-muted p-3"><p className="text-xs text-muted-foreground">Group total</p><PrivacyBalance amount={data.totalBalance} className="text-base" /></div>
        <div className="rounded-xl bg-muted p-3"><p className="text-xs text-muted-foreground">Shares pool</p><PrivacyBalance amount={data.sharesTotal} className="text-base" /></div>
        <div className="rounded-xl bg-muted p-3"><p className="text-xs text-muted-foreground">Social fund</p><PrivacyBalance amount={data.socialBalance} className="text-base" /></div>
      </div>
    </header>
    {notice && <p role="status" className="rounded-xl bg-dusco-green-soft p-4 text-sm text-dusco-green">{notice}</p>}
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold">Actions</h2>
      <div className="flex flex-wrap gap-2">
        <Button className="min-h-11" onClick={() => { setNotice(""); setAction("contribute"); }}>Contribute</Button>
        {canWithdraw(role) ? <Button variant="outline" className="min-h-11" onClick={() => { setNotice(""); setAction("withdraw"); }}>Withdraw</Button> : <Button variant="outline" className="min-h-11" disabled title="Only the admin or treasurer can withdraw">Withdraw</Button>}
        {canInvite(role) ? <Button variant="outline" className="min-h-11" onClick={() => { setNotice(""); setAction("invite"); }}>Invite member</Button> : <Button variant="outline" className="min-h-11" disabled title="Only the group admin can invite">Invite member</Button>}
      </div>
      <p className="text-xs text-muted-foreground">{roleNotice(role) || "Balances stay hidden until you tap to reveal them."}</p>
    </section>
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold">Group bahashas <span className="text-sm font-normal text-muted-foreground">· social fund</span></h2>
      {bahashas.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{bahashas.map((item) => <div key={item.id} className="rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between"><p className="font-display font-semibold">{item.name}</p><span className="text-sm font-medium">{item.percentage}%</span></div>
        <div className="mt-2"><PrivacyBalance amount={item.balance} className="text-base" /></div>
        {item.goalName && item.goalAmount ? <p className="mt-2 text-xs text-muted-foreground">Target: {item.goalName} · TZS {Number(item.goalAmount).toLocaleString("en-US")}</p> : <p className="mt-2 text-xs text-muted-foreground">No target set</p>}
      </div>)}</div> : <p className="rounded-2xl border border-dashed bg-card px-5 py-6 text-center text-sm text-muted-foreground">No group bahashas. Social fund deposits need envelopes — contact your group admin.</p>}
    </section>
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold">Member ledger <span className="text-sm font-normal text-muted-foreground">· {data.memberCount} member{data.memberCount === 1 ? "" : "s"}</span></h2>
      <GroupMembers members={members} />
    </section>
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold">Recent group activity</h2>
      <TransactionRows transactions={data.recentTransactions || []} />
      <Link to="/app/transactions" className="inline-flex min-h-11 items-center text-sm font-medium text-primary">View all your activity</Link>
    </section>
    {action === "contribute" && <GroupContributeForm group={group} onClose={() => setAction(null)} onSaved={(message) => { setNotice(message); refresh(); }} />}
    {action === "withdraw" && <GroupWithdrawForm group={group} bahashas={bahashas} onClose={() => setAction(null)} onSaved={(message) => { setNotice(message); refresh(); }} />}
    {action === "invite" && <GroupInviteForm group={group} onClose={() => setAction(null)} onSaved={(message) => { setNotice(message); refresh(); }} />}
  </div>;
}