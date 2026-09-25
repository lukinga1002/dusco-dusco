import React from "react";
import { Split, Wallet, Users, Lock, Bell, Target } from "lucide-react";
import { useT } from "@/lib/i18n";

// Icons and keys at module scope; text resolved inside the component.
const FEATURES = [
  { icon: Split, t: "landing.features.1.title", d: "landing.features.1.body" },
  { icon: Wallet, t: "landing.features.2.title", d: "landing.features.2.body" },
  { icon: Target, t: "landing.features.3.title", d: "landing.features.3.body" },
  { icon: Users, t: "landing.features.4.title", d: "landing.features.4.body" },
  { icon: Lock, t: "landing.features.5.title", d: "landing.features.5.body" },
  { icon: Bell, t: "landing.features.6.title", d: "landing.features.6.body" },
];

export default function Features() {
  const t = useT();
  return (
    <section className="max-w-3xl mx-auto px-5 py-16">
      <h2 className="font-display text-3xl font-semibold text-center">{t("landing.features.title")}</h2>
      <div className="grid sm:grid-cols-2 gap-4 mt-10">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white border border-dusco-line">
              <div className="w-11 h-11 rounded-xl bg-dusco-gold-soft flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display font-semibold">{t(f.t)}</p>
                <p className="text-sm text-dusco-ink-soft mt-1 leading-relaxed">{t(f.d)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
