import React from "react";
import { ShieldCheck } from "lucide-react";
import { useT } from "@/lib/i18n";

// Keys only — resolved inside the component.
const FEES = [
  { label: "landing.trust.fee.depositSame", value: "landing.trust.fee.free" },
  { label: "landing.trust.fee.depositCross", value: "landing.trust.fee.crossValue" },
  { label: "landing.trust.fee.withdrawal", value: "landing.trust.fee.withdrawalValue" },
  { label: "landing.trust.fee.withdrawal90", value: "landing.trust.fee.free" },
  { label: "landing.trust.fee.earlyUnlock", value: "landing.trust.fee.earlyUnlockValue" },
];

export default function Trust() {
  const t = useT();
  return (
    <section className="max-w-3xl mx-auto px-5 py-16">
      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          <ShieldCheck className="w-8 h-8 text-dusco-green" />
          <h2 className="font-display text-2xl font-semibold mt-4">{t("landing.trust.title")}</h2>
          <p className="text-dusco-ink-soft mt-3 leading-relaxed">
            {t("landing.trust.body")}
          </p>
          <p className="text-xs text-dusco-ink-mute mt-4">
            {t("landing.trust.disclaimer")}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-dusco-line overflow-hidden self-start">
          <p className="px-4 py-3 border-b border-dusco-line font-display font-semibold text-sm">{t("landing.trust.feesTitle")}</p>
          {FEES.map((f, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-dusco-line/60 last:border-0">
              <span className="text-sm text-dusco-ink-soft">{t(f.label)}</span>
              <span className="text-sm font-medium text-dusco-ink text-right">{t(f.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}