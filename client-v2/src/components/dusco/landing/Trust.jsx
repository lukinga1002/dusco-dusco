import React from "react";
import { ShieldCheck } from "lucide-react";

const FEES = [
  { label: "Deposit (same network)", value: "Free" },
  { label: "Deposit (cross network)", value: "1% · min TZS 500" },
  { label: "Withdrawal", value: "1% · TZS 500–5,000" },
  { label: "Withdrawal after 90 days", value: "Free" },
  { label: "Early unlock penalty", value: "2% of balance" },
];

export default function Trust() {
  return (
    <section className="max-w-3xl mx-auto px-5 py-16">
      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          <ShieldCheck className="w-8 h-8 text-dusco-green" />
          <h2 className="font-display text-2xl font-semibold mt-4">Trust & transparency</h2>
          <p className="text-dusco-ink-soft mt-3 leading-relaxed">
            Dusco is operated by Larson Consulting, a registered company. Customer funds are
            designed to be held with a licensed financial institution. Every fee is shown before
            a transaction — nothing is hidden.
          </p>
          <p className="text-xs text-dusco-ink-mute mt-4">
            Dusco does not hold customer deposits itself and is not a licensed bank. This is a
            demonstration environment with simulated money movement.
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-dusco-line overflow-hidden self-start">
          <p className="px-4 py-3 border-b border-dusco-line font-display font-semibold text-sm">Fees, plainly</p>
          {FEES.map((f, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-dusco-line/60 last:border-0">
              <span className="text-sm text-dusco-ink-soft">{f.label}</span>
              <span className="text-sm font-medium text-dusco-ink text-right">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}