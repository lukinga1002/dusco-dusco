import React from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

// Unbundled consent checkboxes — not pre-ticked, separate, explicit.
export default function ConsentCheckboxes({ consents, onChange, errors }) {
  const t = useT();
  const set = (key, value) => onChange({ ...consents, [key]: value });

  return (
    <div className="space-y-3">
      <ConsentRow
        checked={consents.operate}
        onChange={(v) => set("operate", v)}
        error={errors?.operate}
        title={t("auth.consent.operate")}
        desc={t("auth.consent.operateHelp")}
        required
      />
      <ConsentRow
        checked={consents.marketing}
        onChange={(v) => set("marketing", v)}
        error={errors?.marketing}
        title={t("auth.consent.marketing")}
        desc={t("auth.consent.marketingHelp")}
      />
      <p className="text-xs text-dusco-ink-mute px-1">
        {t("auth.consent.reviewPrefix")}{" "}
        <a href="/privacy" className="underline text-dusco-ink hover:text-dusco-red">{t("auth.consent.reviewLink")}</a>.
      </p>
    </div>
  );
}

function ConsentRow({ checked, onChange, title, desc, required, error }) {
  return (
    <label
      className={cn(
        "flex gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors",
        checked ? "border-dusco-red bg-dusco-red-tint" : "border-dusco-line bg-white",
        error && "border-dusco-red"
      )}
    >
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-5 h-5 rounded accent-dusco-red shrink-0"
      />
      <div>
        <p className="text-sm text-dusco-ink leading-snug">
          {title} {required && <span className="text-dusco-red">*</span>}
        </p>
        <p className="text-xs text-dusco-ink-mute mt-1">{desc}</p>
        {error && <p className="text-xs text-dusco-red mt-1">{error}</p>}
      </div>
    </label>
  );
}