import React from "react";
import { LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";

/**
 * Transaction PIN entry, shown on the confirmation step of a transfer.
 *
 * The PIN is sent with the withdrawal request itself and checked by the server
 * before any money moves. It is deliberately NOT a separate "authorize" call
 * whose result the browser then acts on — that pattern let anyone skip the PIN
 * by calling the withdrawal endpoint directly.
 */
export default function PinEntry({ value, onChange, error, pinSet, disabled }) {
  if (!pinSet) {
    return (
      <div className="rounded-xl border border-dusco-gold/40 bg-dusco-gold-soft p-4 text-sm">
        <p className="flex items-center gap-2 font-medium">
          <LockKeyhole className="h-4 w-4" />
          Create your transaction PIN first
        </p>
        <p className="mt-1 text-muted-foreground">
          Sending money out needs a 4-digit PIN. It takes a moment to set up.
        </p>
        <Link
          to="/app/settings"
          className="mt-3 inline-flex min-h-11 items-center font-medium text-primary underline"
        >
          Create my PIN
        </Link>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium" htmlFor="transfer-pin">
        Enter your transaction PIN
      </label>
      <Input
        id="transfer-pin"
        type="password"
        inputMode="numeric"
        autoComplete="off"
        maxLength={4}
        placeholder="••••"
        className="mt-1.5 min-h-12 max-w-[9rem] text-center text-lg tracking-[0.5em]"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
      />
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
