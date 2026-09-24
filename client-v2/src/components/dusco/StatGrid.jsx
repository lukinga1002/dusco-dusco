import React from "react";
import { cn } from "@/lib/utils";

export function prettifyKey(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Renders the scalar entries of any object as stat tiles — defensive against
// evolving API shapes. formatValue(key, value) decides how each value displays.
export default function StatGrid({ data, formatValue, max = 8, className }) {
  const entries = Object.entries(data || {})
    .filter(([, value]) => typeof value === "number" || typeof value === "string" || value instanceof Date)
    .filter(([, value]) => value !== "" && value !== null)
    .slice(0, max);
  if (!entries.length) return null;
  return <dl className={cn("grid grid-cols-2 gap-3", className)}>
    {entries.map(([key, value]) => <div key={key} className="rounded-xl bg-muted p-3">
      <dt className="text-xs text-muted-foreground">{prettifyKey(key)}</dt>
      <dd className="mt-1 font-display text-base font-semibold tabular-nums">{formatValue ? formatValue(key, value) : String(value)}</dd>
    </div>)}
  </dl>;
}