import React, { useEffect, useState } from "react";

// Shows a friendly message once a request has been in-flight long enough
// to suggest a cold start (the backend sleeps on the free tier).
export function useColdStartMessage(thresholdMs = 6000) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    setSlow(false);
    const t = setTimeout(() => setSlow(true), thresholdMs);
    return () => clearTimeout(t);
  }, [thresholdMs]);
  return slow;
}

export default function ColdStartLoader({ label = "Waking up secure servers…", sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="relative w-14 h-14 mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-dusco-red-soft" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-dusco-red animate-spin" />
      </div>
      <p className="font-display text-lg text-dusco-ink">{label}</p>
      {sub && <p className="text-sm text-dusco-ink-mute mt-1.5 max-w-xs">{sub}</p>}
    </div>
  );
}