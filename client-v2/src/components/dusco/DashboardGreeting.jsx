import React from "react";
import { Copy, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function DashboardGreeting({ user }) {
  const copy = useMutation({ mutationFn: () => navigator.clipboard.writeText(user.duscoNumber) });
  return <div className="space-y-4">
    <div><p className="text-xs uppercase tracking-widest text-muted-foreground">Your savings, with purpose</p><h1 className="mt-2 font-display text-3xl font-semibold">Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : " back"}.</h1></div>
    {user?.duscoNumber && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dusco-gold/20 bg-dusco-gold-soft/50 p-4">
      <div><p className="text-xs text-muted-foreground">Your Dusco number</p><p className="mt-1 font-mono text-lg font-semibold tracking-wide">{user.duscoNumber}</p></div>
      <Button variant="outline" onClick={() => copy.mutate()} disabled={copy.isPending} className="min-h-11 gap-2">{copy.isSuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copy.isSuccess ? "Copied" : "Copy number"}</Button>
      {copy.isError && <p role="alert" className="w-full text-xs text-destructive">Copy is unavailable in this browser. Select and copy the number above.</p>}
    </div>}
  </div>;
}