import React from "react";
import { useT } from "@/lib/i18n";

// Keys only at module scope — resolved inside the component.
const STEPS = [
  { n: "01", t: "landing.how.1.title", d: "landing.how.1.body" },
  { n: "02", t: "landing.how.2.title", d: "landing.how.2.body" },
  { n: "03", t: "landing.how.3.title", d: "landing.how.3.body" },
];

export default function HowItWorks() {
  const t = useT();
  return (
    <section id="how" className="bg-white border-y border-dusco-line">
      <div className="max-w-3xl mx-auto px-5 py-16">
        <h2 className="font-display text-3xl font-semibold text-center">{t("landing.how.title")}</h2>
        <p className="text-dusco-ink-soft text-center mt-2">{t("landing.how.subtitle")}</p>
        <div className="grid sm:grid-cols-3 gap-5 mt-10">
          {STEPS.map((s, i) => (
            <div key={i} className="relative">
              <p className="font-display text-5xl font-semibold text-dusco-gold">{s.n}</p>
              <p className="font-display text-lg font-semibold mt-2">{t(s.t)}</p>
              <p className="text-sm text-dusco-ink-soft mt-2 leading-relaxed">{t(s.d)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
