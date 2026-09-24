import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import { api } from "@/lib/duscoApi";

// Closing an account cannot be undone, so this deliberately takes several
// steps: the person sees what is blocking it, then exactly what is erased and
// what is kept, then re-enters their password and types DELETE.
export default function DeleteAccount() {
  const { user, logout } = useDuscoAuth();
  const client = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const preview = useQuery({
    queryKey: ["dusco", user?.id, "deletion-preview"],
    queryFn: () => api.deletionPreview(),
    retry: false,
    enabled: open,
  });

  const remove = useMutation({
    mutationFn: () => api.deleteAccount({ password, confirm }),
    onSuccess: async () => {
      await client.cancelQueries({ queryKey: ["dusco"] });
      logout();
      client.removeQueries({ queryKey: ["dusco"] });
      navigate("/", { replace: true, state: { accountClosed: true } });
    },
    onError: (err) => setError(err.message),
  });

  if (!open) {
    return (
      <Button variant="outline" className="min-h-11" onClick={() => setOpen(true)}>
        Delete my account
      </Button>
    );
  }

  const blockers = preview.data?.blockers || [];
  const canDelete = preview.data?.canDelete;
  const ready = canDelete && password.length > 0 && confirm === "DELETE";

  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 space-y-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div>
          <p className="font-medium">Close your Dusco account</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This cannot be undone.
          </p>
        </div>
      </div>

      {preview.isPending ? (
        <p role="status" className="text-sm text-muted-foreground">Checking your account…</p>
      ) : preview.isError ? (
        <div className="space-y-2">
          <p role="alert" className="text-sm text-destructive">{preview.error.message}</p>
          <Button variant="outline" className="min-h-11" onClick={() => preview.refetch()}>Try again</Button>
        </div>
      ) : (
        <>
          {blockers.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Before you can close this account:</p>
              <ul className="space-y-2">
                {blockers.map((b) => (
                  <li key={b.code + (b.groupId || "")} className="rounded-lg bg-card p-3 text-sm">
                    {b.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-card p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Will be erased
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {(preview.data.willErase || []).map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
            <div className="rounded-lg bg-card p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Will be kept
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {(preview.data.willRetain || []).map((t) => <li key={t}>{t}</li>)}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Kept because financial records must be retained — but no longer linked to your name.
              </p>
            </div>
          </div>

          {canDelete && (
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Confirm your password
                <Input
                  type="password"
                  className="mt-1.5 min-h-12"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                />
              </label>
              <label className="block text-sm font-medium">
                Type DELETE to confirm
                <Input
                  className="mt-1.5 min-h-12"
                  value={confirm}
                  placeholder="DELETE"
                  onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                />
              </label>
            </div>
          )}

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="min-h-11 border-destructive text-destructive"
              disabled={!ready || remove.isPending}
              onClick={() => { setError(""); remove.mutate(); }}
            >
              {remove.isPending ? "Closing…" : "Permanently close my account"}
            </Button>
            <Button
              variant="outline"
              className="min-h-11"
              disabled={remove.isPending}
              onClick={() => { setOpen(false); setPassword(""); setConfirm(""); setError(""); }}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
