import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

export default function Groups() {
  return (
    <section className="bg-dusco-ink text-white">
      <div className="max-w-3xl mx-auto px-5 py-16 grid sm:grid-cols-2 gap-8 items-center">
        <div>
          <span className="text-xs uppercase tracking-wider text-dusco-gold-soft font-medium">For groups · Kikoba / VICOBA</span>
          <h2 className="font-display text-3xl font-semibold mt-3">The digital cash box</h2>
          <p className="text-white/70 mt-3 leading-relaxed">
            Give your chama its own Dusco number. Track each member's contributions, keep shares
            and the social fund separate, and see the group's total at a glance.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-2xl bg-dusco-gold text-white font-medium hover:bg-dusco-gold/90 transition-colors">
            Start a group <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="rounded-2xl bg-white/10 p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <p className="font-display font-semibold">Umoja Savings Group</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-dusco-gold-soft text-primary">DUS-G7K2P4</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-white/60">Shares</p>
              <p className="font-display text-lg font-semibold tabular-nums">TZS 1,240,000</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-white/60">Social fund</p>
              <p className="font-display text-lg font-semibold tabular-nums">TZS 380,000</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {["Amani · TZS 320,000", "Neema · TZS 280,000", "Juma · TZS 240,000"].map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                <Check className="w-4 h-4 text-emerald-400" /> {m}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}