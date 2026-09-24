import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { api } from "@/lib/duscoApi";

// Right of access / portability. The password is asked for again because this
// hands over a complete financial history in one file.
export default function DownloadMyData() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const run = useMutation({
    mutationFn: () => api.exportData({ password }),
    onSuccess: (data) => {
      // Saved from the browser rather than followed as a link, so the file is
      // never fetched through a URL that could be shared or logged.
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dusco-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDone(true);
      setPassword("");
      setError("");
    },
    onError: (err) => setError(err.message),
  });

  if (!open) {
    return (
      <Button variant="outline" className="min-h-11 gap-2" onClick={() => { setOpen(true); setDone(false); }}>
        <Download className="h-4 w-4" />
        Download my data
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div>
        <p className="font-medium">Download a copy of your data</p>
        <p className="mt-1 text-sm text-muted-foreground">
          A JSON file with your profile, bahashas, full transaction history, dividends,
          notifications, consent record, and your own contributions to each group.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          It does not include other members of your groups — their details are their personal
          data, not yours.
        </p>
      </div>

      {done ? (
        <div className="space-y-3">
          <p role="status" className="flex items-center gap-2 text-sm text-dusco-green">
            <Check className="h-4 w-4" />
            Your file has been saved to this device.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="min-h-11" onClick={() => setDone(false)}>
              Download again
            </Button>
            <Button variant="outline" className="min-h-11" onClick={() => { setOpen(false); setDone(false); }}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <>
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

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <Button
              className="min-h-11"
              disabled={!password || run.isPending}
              onClick={() => { setError(""); run.mutate(); }}
            >
              {run.isPending ? "Preparing your file…" : "Download"}
            </Button>
            <Button
              variant="outline"
              className="min-h-11"
              disabled={run.isPending}
              onClick={() => { setOpen(false); setPassword(""); setError(""); }}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
