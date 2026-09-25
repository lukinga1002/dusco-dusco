import React from "react";
import { useT } from "@/lib/i18n";

// Keys only at module scope — the text is resolved inside the component, where
// the hook is available and re-renders when the language changes.
const PROBLEMS = [
  { t: "landing.problem.1.title", d: "landing.problem.1.body" },
  { t: "landing.problem.2.title", d: "landing.problem.2.body" },
  { t: "landing.problem.3.title", d: "landing.problem.3.body" },
];

export default function Problem() {
  const t = useT();
  return (
    <section className="max-w-3xl mx-auto px-5 py-16">
      <div className="grid sm:grid-cols-3 gap-4">
        {PROBLEMS.map((p, i) => (
          <div key={i} className="rounded-2xl bg-white border border-dusco-line p-5">
            <p className="font-display font-semibold text-dusco-ink">{t(p.t)}</p>
            <p className="text-sm text-dusco-ink-soft mt-2 leading-relaxed">{t(p.d)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
