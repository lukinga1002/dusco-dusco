import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const ITEMS = [
  { q: "What is a bahasha?", a: "A bahasha is a savings envelope — a pot of money set aside for a purpose, like school fees or emergencies. You set what percentage of every incoming deposit goes to each one." },
  { q: "Do I need a new phone number?", a: "No. You get one Dusco number (like DUS-A3K9M2). People send money to it from any network or bank, and it routes into your envelopes." },
  { q: "Is my money safe?", a: "Dusco is operated by Larson Consulting and customer funds are designed to be held with a licensed financial institution. This demo uses simulated money — no real funds move." },
  { q: "Can I lock my savings?", a: "Yes. Lock a bahasha until a future date to keep it untouched. Unlocking early applies a 2% penalty on the balance; unlocking after the date is free." },
];

export default function Faq() {
  const [open, setOpen] = useState(null);
  return (
    <section className="bg-white border-y border-dusco-line">
      <div className="max-w-3xl mx-auto px-5 py-16">
        <h2 className="font-display text-3xl font-semibold text-center">Questions</h2>
        <div className="mt-8 space-y-2">
          {ITEMS.map((it, i) => (
            <div key={i} className="rounded-2xl border border-dusco-line overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-medium text-dusco-ink">{it.q}</span>
                <ChevronDown className={`w-5 h-5 text-dusco-ink-mute transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <p className="px-5 pb-4 text-sm text-dusco-ink-soft leading-relaxed">{it.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}