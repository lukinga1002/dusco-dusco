import React, { useState } from "react";
import { Plus, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/duscoApi";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import QueryFeedback from "@/components/dusco/QueryFeedback";
import GroupCard from "@/components/dusco/group/GroupCard";
import GroupCreateForm from "@/components/dusco/group/GroupCreateForm";

export default function Groups() {
  const { user } = useDuscoAuth();
  const [creating, setCreating] = useState(false);
  const query = useQuery({ queryKey: ["dusco", user?.id, "groups"], queryFn: () => api.getGroups(), retry: false, staleTime: 15000 });
  const groups = query.data?.groups || [];
  return <div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="font-display text-3xl font-semibold">Groups</h1><p className="mt-2 text-sm text-muted-foreground">Run your kikoba with one number and a clear member ledger.</p></div>
      <Button className="min-h-11 gap-2" disabled={query.isPending || query.isError} onClick={() => setCreating(true)}><Plus className="h-4 w-4" />Start a group</Button>
    </header>
    {query.isPending ? <QueryFeedback label="Loading your groups…" /> : query.isError ? <QueryFeedback error={query.error} onRetry={query.refetch} /> : groups.length ? (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{groups.map((group) => <GroupCard key={group.id} group={group} />)}</div>
    ) : (
      <div className="rounded-2xl border border-dashed bg-card px-6 py-10 text-center">
        <Users className="mx-auto mb-3 h-8 w-8 text-primary" />
        <h2 className="font-display text-xl">Your digital cash box</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">Create a group to get its own Dusco number, track every member’s shares, and keep the social fund separate.</p>
        <Button className="mt-4 min-h-11" onClick={() => setCreating(true)}>Start your first group</Button>
      </div>
    )}
    {creating && <GroupCreateForm onClose={() => setCreating(false)} />}
    <p className="text-center text-xs text-muted-foreground">Demo environment · Group money is simulated</p>
  </div>;
}