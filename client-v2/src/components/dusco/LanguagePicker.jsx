import React from "react";
import { cn } from "@/lib/utils";
import { LANGUAGES, useLanguage } from "@/lib/i18n";

/**
 * Language choice. Shown at registration (where the person must pick) and in
 * Settings (where they can change it).
 *
 * Each option is labelled in its OWN language — "English", "Kiswahili" — so it
 * is readable to the person who wants it, whichever language the page is
 * currently rendering in.
 */
export default function LanguagePicker({ value, onChange, className, ariaLabel }) {
  const { language, setLanguage } = useLanguage();
  // Uncontrolled: fall back to changing the app language directly.
  const current = value ?? language;
  const pick = onChange ?? setLanguage;

  return (
    <div role="radiogroup" aria-label={ariaLabel || "Language"} className={cn("grid grid-cols-2 gap-2", className)}>
      {LANGUAGES.map((l) => {
        const selected = current === l.code;
        return (
          <button
            key={l.code}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => pick(l.code)}
            className={cn(
              "min-h-12 rounded-xl border px-4 text-sm font-medium transition-colors",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-dusco-line bg-white text-dusco-ink hover:bg-dusco-sand"
            )}
          >
            {l.native}
          </button>
        );
      })}
    </div>
  );
}
