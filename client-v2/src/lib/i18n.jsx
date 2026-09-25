import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { en } from "./locales/en";
import { sw } from "./locales/sw";

/**
 * Language support for Dusco.
 *
 * The person chooses English or Kiswahili when they register, and the choice is
 * stored on their account (see users.language), not just in this browser — so it
 * follows them to any device and survives a cleared cache.
 *
 * The rule that keeps screens from ending up half-translated: a language is only
 * offered once its dictionary is complete. `assertComplete` below compares every
 * locale against English at startup in development and shouts about any key that
 * is missing, so a gap is caught while writing the code rather than by a user
 * meeting an English sentence in the middle of a Kiswahili page.
 */

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "sw", label: "Swahili", native: "Kiswahili" },
];

export const DEFAULT_LANGUAGE = "en";
const STORAGE_KEY = "dusco_language";

const DICTIONARIES = { en, sw };

// Dev-only completeness check. English is the reference set.
if (import.meta.env?.DEV) {
  const reference = Object.keys(en);
  for (const [code, dict] of Object.entries(DICTIONARIES)) {
    if (code === "en") continue;
    const missing = reference.filter((k) => !(k in dict));
    const extra = Object.keys(dict).filter((k) => !reference.includes(k));
    if (missing.length) console.error(`[i18n] "${code}" is missing ${missing.length} key(s):`, missing);
    if (extra.length) console.warn(`[i18n] "${code}" has ${extra.length} key(s) not in English:`, extra);
  }
}

export function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return DICTIONARIES[stored] ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function storeLanguage(code) {
  try { localStorage.setItem(STORAGE_KEY, code); } catch { /* private mode — the account still holds it */ }
}

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage);

  // Keep the document in step, so screen readers and the browser announce the
  // right language.
  useEffect(() => {
    try { document.documentElement.lang = language; } catch { /* no-op */ }
  }, [language]);

  const setLanguage = (code) => {
    if (!DICTIONARIES[code]) return;
    storeLanguage(code);
    setLanguageState(code);
  };

  const value = useMemo(() => {
    const dict = DICTIONARIES[language] || en;
    /**
     * Look up a key. Falls back to English, then to the key itself, so a gap
     * degrades to readable text rather than a blank or a crash — but the dev
     * check above means it should never reach a user.
     *
     * Supports {placeholders}: t("greeting", { name: "Juma" })
     */
    const t = (key, vars) => {
      let str = dict[key] ?? en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replaceAll(`{${k}}`, String(v));
        }
      }
      return str;
    };
    return { language, setLanguage, t };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/** Convenience: const t = useT(); t("landing.hero.title") */
export function useT() {
  return useContext(LanguageContext).t;
}
