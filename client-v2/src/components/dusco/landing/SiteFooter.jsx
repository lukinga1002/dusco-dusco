import React from "react";
import { Link } from "react-router-dom";
import { useT } from "@/lib/i18n";

export default function SiteFooter() {
  const t = useT();
  return (
    <footer className="max-w-3xl mx-auto px-5 py-12">
      <div className="flex items-center gap-2.5 mb-6">
        <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-dusco-gold-soft font-display font-bold">D</span>
        <span className="font-display font-semibold text-lg">Dusco</span>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-dusco-ink-soft">
        <Link to="/privacy" className="hover:text-dusco-ink">{t("landing.footer.privacy")}</Link>
        <Link to="/terms" className="hover:text-dusco-ink">{t("landing.footer.terms")}</Link>
        <Link to="/login" className="hover:text-dusco-ink">{t("common.login")}</Link>
        <Link to="/register" className="hover:text-dusco-ink">{t("common.getStarted")}</Link>
      </div>
      <p className="text-xs text-dusco-ink-mute mt-6">
        {t("landing.footer.copyright", { year: new Date().getFullYear() })}
      </p>
    </footer>
  );
}