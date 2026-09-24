import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";
import { api } from "@/lib/duscoApi";
import QueryFeedback from "@/components/dusco/QueryFeedback";
import { formatDate } from "@/lib/duscoFormat";

// Consent lives on the server as an append-only audit log, so this reads and
// writes the account-level record rather than anything in browser storage.
// A cleared cache or a new device must not change what the person agreed to.
export default function ConsentSettings() {
  const { user } = useDuscoAuth();
  const client = useQueryClient();
  const prefix = ["dusco", user?.id];
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState("");

  const consent = useQuery({
    queryKey: [...prefix, "consent"],
    queryFn: () => api.getConsent(),
    retry: false,
    staleTime: 30000,
  });

  const history = useQuery({
    queryKey: [...prefix, "consent-history"],
    queryFn: () => api.consentHistory(),
    retry: false,
    enabled: showHistory,
  });

  const update = useMutation({
    mutationFn: (decisions) => api.recordConsent({ decisions, source: "settings" }),
    onSuccess: (data) => {
      setError("");
      client.setQueryData([...prefix, "consent"], data);
      client.invalidateQueries({ queryKey: [...prefix, "consent-history"] });
    },
    onError: (err) => setError(err.message),
  });

  if (consent.isPending) return <QueryFeedback label="Loading your consent record…" />;
  if (consent.isError) return <QueryFeedback error={consent.error} onRetry={consent.refetch} />;

  const purposes = consent.data?.purposes || [];
  const needsAny = purposes.some((p) => p.needsReconfirmation);

  return (
    <div className="space-y-3">
      {needsAny && (
        <p className="rounded-xl bg-dusco-gold-soft p-4 text-sm">
          Our Privacy Notice has been updated since you last agreed. Please review and confirm your
          choices below.
        </p>
      )}

      {purposes.map((p) => (
        <PurposeRow
          key={p.purpose}
          purpose={p}
          busy={update.isPending}
          onSet={(granted) => update.mutate([{ purpose: p.purpose, granted }])}
        />
      ))}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Your choices are recorded against your account, not this device, so they follow you
        wherever you sign in. Policy version {consent.data?.policyVersion}.
      </p>

      <div>
        <Button
          variant="outline"
          className="min-h-11 gap-2"
          onClick={() => setShowHistory((v) => !v)}
        >
          <History className="h-4 w-4" />
          {showHistory ? "Hide consent history" : "View consent history"}
        </Button>
      </div>

      {showHistory && (
        <div className="rounded-xl border">
          {history.isPending ? (
            <p className="p-4 text-sm text-muted-foreground">Loading your record…</p>
          ) : history.isError ? (
            <div className="p-4">
              <QueryFeedback error={history.error} onRetry={history.refetch} />
            </div>
          ) : (history.data?.history || []).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No decisions recorded yet.</p>
          ) : (
            <ul className="divide-y">
              {history.data.history.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                  <span className="font-medium">
                    {labelFor(row.purpose)} — {row.granted ? "agreed" : "withdrawn"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(row.recordedAt)} · {row.source} · v{row.policyVersion}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function PurposeRow({ purpose, onSet, busy }) {
  const { granted, required, label, description, recordedAt, needsReconfirmation } = purpose;
  const state = granted === null ? "Not answered" : granted ? "Active" : "Withdrawn";

  return (
    <div className="rounded-xl bg-muted p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium">
          {label} — {state}
        </p>
        {required && (
          <span className="inline-flex items-center gap-1 rounded-full bg-dusco-green-soft px-2.5 py-1 text-xs text-dusco-green">
            <ShieldCheck className="h-3.5 w-3.5" />
            Required
          </span>
        )}
      </div>

      <p className="mt-1 text-xs text-muted-foreground">{description}</p>

      {recordedAt && (
        <p className="mt-1 text-xs text-muted-foreground">
          {granted ? "Agreed" : "Withdrawn"} {formatDate(recordedAt)}.
        </p>
      )}

      {required ? (
        // Withdrawing this would mean the service can no longer lawfully run,
        // so it is an account-closure decision rather than a toggle. Say so
        // plainly instead of offering a control that cannot be honoured.
        <p className="mt-2 text-xs text-muted-foreground">
          The savings service cannot run without this. To withdraw it, close your account using
          “Delete my account” below.
        </p>
      ) : (
        <Button
          variant="outline"
          className="mt-3 min-h-11"
          disabled={busy}
          onClick={() => onSet(!granted)}
        >
          {busy ? "Saving…" : granted ? "Withdraw this consent" : "Give this consent"}
        </Button>
      )}

      {needsReconfirmation && !required && (
        <p className="mt-2 text-xs text-muted-foreground">
          Recorded under an earlier version of the Privacy Notice.
        </p>
      )}
    </div>
  );
}

function labelFor(purpose) {
  if (purpose === "service_operation") return "Operating your savings service";
  if (purpose === "marketing") return "Product and marketing messages";
  return purpose;
}
