import React from "react";

const PROBLEMS = [
  { t: "Savings are fragmented", d: "Money sits across networks and pockets, divided by purpose — hard to see the whole picture." },
  { t: "Networks don't talk", d: "Receiving from M-Pesa, Airtel, or a bank means juggling fees and references for every transfer." },
  { t: "Groups run on paper", d: "Kikoba and VICOBA track contributions in notebooks and cash boxes — no clear member ledger." },
];

export default function Problem() {
  return (
    <section className="max-w-3xl mx-auto px-5 py-16">
      <div className="grid sm:grid-cols-3 gap-4">
        {PROBLEMS.map((p, i) => (
          <div key={i} className="rounded-2xl bg-white border border-dusco-line p-5">
            <p className="font-display font-semibold text-dusco-ink">{p.t}</p>
            <p className="text-sm text-dusco-ink-soft mt-2 leading-relaxed">{p.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}