import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck, FileText } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import { api } from "@/lib/duscoApi";
import QueryFeedback from "@/components/dusco/QueryFeedback";
import ConsentSettings from "@/components/dusco/ConsentSettings";
import DownloadMyData from "@/components/dusco/DownloadMyData";
import DeleteAccount from "@/components/dusco/DeleteAccount";
import { formatDate } from "@/lib/duscoFormat";

export default function Settings() {
  const { user, logout } = useDuscoAuth();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [name, setName] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const profile = useQuery({ queryKey: ["dusco", user?.id, "profile"], queryFn: () => api.me(), retry: false, staleTime: 60000 });
  const me = profile.data || user || {};
  const currentName = name ?? (me.name || "");
  const saveName = async (event) => {
    event.preventDefault();
    setError(""); setNotice("");
    if (!currentName.trim()) return setError("Enter your name.");
    setSaving(true);
    try {
      await api.updateProfile({ name: currentName.trim() });
      await profile.refetch();
      client.setQueryData(["dusco", user?.id, "profile"], (old) => old ? { ...old, name: currentName.trim() } : old);
      setNotice("Name updated.");
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };
  const signOut = async () => {
    await client.cancelQueries({ queryKey: ["dusco"] });
    logout();
    client.removeQueries({ queryKey: ["dusco"] });
    navigate("/login", { replace: true });
  };
  return <div className="space-y-6">
    <header><h1 className="font-display text-3xl font-semibold">Settings</h1><p className="mt-2 text-sm text-muted-foreground">Your profile, consents, and data rights.</p></header>
    {notice && <p role="status" className="rounded-xl bg-dusco-green-soft p-4 text-sm text-dusco-green">{notice}</p>}
    {profile.isPending ? <QueryFeedback label="Loading your profile…" /> : profile.isError ? <QueryFeedback error={profile.error} onRetry={profile.refetch} /> : <>
      <section className="space-y-4 rounded-2xl border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Profile</h2>
        <form onSubmit={saveName} className="space-y-3">
          <label className="block text-sm font-medium">Full name<Input className="mt-1.5 min-h-12" value={currentName} onChange={(event) => setName(event.target.value)} maxLength={60} autoComplete="name" /></label>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-muted-foreground">Phone number</p><p className="mt-1 font-medium">{me.phone || "—"}</p></div>
            <div><p className="text-muted-foreground">Dusco number</p><p className="mt-1 font-mono font-medium">{me.duscoNumber || "—"}</p></div>
          </div>
          {(me.createdAt || me.memberSince) && <p className="text-xs text-muted-foreground">Member since {formatDate(me.createdAt || me.memberSince)}</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="min-h-11" disabled={saving}>{saving ? "Saving…" : "Save name"}</Button>
        </form>
      </section>
      <section className="space-y-3 rounded-2xl border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Your consent</h2>
        <ConsentSettings />
      </section>
      <section className="space-y-3 rounded-2xl border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Notification preferences</h2>
        <p className="text-sm text-muted-foreground">Push, email, and SMS preferences with per-category controls are coming. For now, notifications appear in the bell panel. <span className="text-xs">(Pending backend support)</span></p>
      </section>
      <section className="space-y-3 rounded-2xl border bg-card p-5">
        <h2 className="font-display text-lg font-semibold">Your data rights</h2>
        <p className="text-sm text-muted-foreground">Under the Personal Data Protection Act (Cap. 44, 2023) you can request a copy of your data, corrections, or deletion of your account.</p>
        <DownloadMyData />
        <DeleteAccount />
        <div className="flex flex-wrap gap-4 pt-1 text-sm">
          <Link to="/privacy" className="inline-flex min-h-11 items-center gap-1.5 font-medium text-primary"><ShieldCheck className="h-4 w-4" />Privacy Notice</Link>
          <Link to="/terms" className="inline-flex min-h-11 items-center gap-1.5 font-medium text-primary"><FileText className="h-4 w-4" />Terms of Service</Link>
        </div>
      </section>
    </>}
    <Button variant="outline" className="min-h-12 w-full gap-2 text-destructive" onClick={signOut}><LogOut className="h-4 w-4" />Log out</Button>
  </div>;
}