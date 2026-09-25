import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useT } from "@/lib/i18n";

// Keys only — resolved inside the component.
const ITEMS = [
  { q: "landing.faq.1.q", a: "landing.faq.1.a" },
  { q: "landing.faq.2.q", a: "landing.faq.2.a" },
  { q: "landing.faq.3.q", a: "landing.faq.3.a" },
  { q: "landing.faq.4.q", a: "landing.faq.4.a" },
];

export default function Faq() {
  const t = useT();
  const [open, setOpen] = useState(null);
  return (
    <section className="bg-white border-y border-dusco-line">
      <div className="max-w-3xl mx-auto px-5 py-16">
        <h2 className="font-display text-3xl font-semibold text-center">{t("landing.faq.title")}</h2>
        <div className="mt-8 space-y-2">
          {ITEMS.map((it, i) => (
            <div key={i} className="rounded-2xl border border-dusco-line overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-medium text-dusco-ink">{t(it.q)}</span>
                <ChevronDown className={`w-5 h-5 text-dusco-ink-mute transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <p className="px-5 pb-4 text-sm text-dusco-ink-soft leading-relaxed">{t(it.a)}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
