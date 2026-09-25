import React from "react";
import { Split, Wallet, Users, Lock, Bell, Target } from "lucide-react";

const FEATURES = [
  { icon: Split, t: "Automatic splitting", d: "Every deposit divides across your envelopes by the percentages you set." },
  { icon: Wallet, t: "Receive from any network", d: "M-Pesa, Airtel, Tigo, banks — one number accepts them all." },
  { icon: Target, t: "Goals & locks", d: "Set a target on any envelope, or lock it until a date to resist temptation." },
  { icon: Users, t: "Group savings", d: "Run a kikoba with a group number, member ledger, and shares + social fund." },
  { icon: Lock, t: "Private by default", d: "Balances are blurred until you tap to reveal — safe in shared spaces." },
  { icon: Bell, t: "Transparent fees", d: "Every fee is shown before money moves. No surprises, ever." },
];

export default function Features() {
  return (
    <section className="max-w-3xl mx-auto px-5 py-16">
      <h2 className="font-display text-3xl font-semibold text-center">Built for how you save</h2>
      <div className="grid sm:grid-cols-2 gap-4 mt-10">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white border border-dusco-line">
              <div className="w-11 h-11 rounded-xl bg-dusco-gold-soft flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display font-semibold">{f.t}</p>
                <p className="text-sm text-dusco-ink-soft mt-1 leading-relaxed">{f.d}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}