import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/duscoApi";
import QueryFeedback from "@/components/dusco/QueryFeedback";
import { formatTZS } from "@/lib/duscoFormat";

// Transaction PIN and withdrawal limits. The server is what enforces both on
// the withdrawal itself; this screen only shows the state and sets the PIN.
export default function SecuritySettings() {
  const client = useQueryClient();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const security = useQuery({ queryKey: ["dusco", "security"], queryFn: () => api.getSecurity(), retry: false });

  const save = useMutation({
    mutationFn: () => api.setPin(security.data?.pinSet ? { pin, currentPin } : { pin }),
    onSuccess: (data) => {
      client.setQueryData(["dusco", "security"], data);
      setPin(""); setConfirmPin(""); setCurrentPin(""); setError("");
      setNotice(data.message || "PIN saved.");
    },
    onError: (err) => { setError(err.message); setNotice(""); },
  });

  if (security.isPending) return <QueryFeedback label="Loading your security settings…" />;
  if (security.isError) return <QueryFeedback error={security.error} onRetry={security.refetch} />;

  const s = security.data;
  const submit = (event) => {
    event.preventDefault();
    setError(""); setNotice("");
    if (!/^\d{4}$/.test(pin)) return setError("Your PIN must be 4 digits.");
    if (pin !== confirmPin) return setError("The two PINs do not match.");
    if (s.pinSet && !/^\d{4}$/.test(currentPin)) return setError("Enter your current PIN.");
    save.mutate();
  };

  return (
    <div className="space-y-4">
      {notice && <p role="status" className="rounded-xl bg-dusco-green-soft p-4 text-sm text-dusco-green">{notice}</p>}

      <div className="rounded-xl bg-muted p-4 text-sm">
        <p className="flex items-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4 text-primary" />
          {s.tierName} account
        </p>
        <p className="mt-2 text-muted-foreground">
          {s.canWithdraw
            ? `You can send up to ${formatTZS(s.limits.perTxn)} in one transfer, and ${formatTZS(s.limits.monthly)} a month.`
            : "You can save and receive money. To send money out, your identity needs to be verified."}
        </p>
        {s.canWithdraw && (
          <p className="mt-1 text-xs text-muted-foreground">
            Used this month: {formatTZS(s.usage.withdrawn)} · {formatTZS(s.usage.remaining)} left.
          </p>
        )}
      </div>

      <form onSubmit={submit} className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          <LockKeyhole className="h-4 w-4" />
          {s.pinSet ? "Change your transaction PIN" : "Create your transaction PIN"}
        </p>
        <p className="text-xs text-muted-foreground">
          Needed every time you send money out. Avoid 1111 or 1234 — those are the first ones
          anyone tries.
        </p>

        {s.pinSet && (
          <label className="block text-sm font-medium">
            Current PIN
            <Input type="password" inputMode="numeric" maxLength={4}
              className="mt-1.5 min-h-12 max-w-[9rem] text-center tracking-[0.5em]"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />
          </label>
        )}

        <label className="block text-sm font-medium">
          New PIN
          <Input type="password" inputMode="numeric" maxLength={4}
            className="mt-1.5 min-h-12 max-w-[9rem] text-center tracking-[0.5em]"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />
        </label>

        <label className="block text-sm font-medium">
          Confirm new PIN
          <Input type="password" inputMode="numeric" maxLength={4}
            className="mt-1.5 min-h-12 max-w-[9rem] text-center tracking-[0.5em]"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />
        </label>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="min-h-11" disabled={save.isPending}>
          {save.isPending ? "Saving…" : s.pinSet ? "Change PIN" : "Create PIN"}
        </Button>
      </form>
    </div>
  );
}
