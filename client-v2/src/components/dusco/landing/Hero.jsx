import { useT } from "@/lib/i18n";
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import HeroVisual from "./HeroVisual";

export default function Hero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden bg-dusco-ink">
      {/* ambient glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-dusco-gold/20 blur-3xl pointer-events-none" />
      <div className="absolute top-48 -left-32 w-96 h-96 rounded-full bg-primary/40 blur-3xl pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-5 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {t("landing.operatedBy")}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight mt-5 text-white">
            {t("landing.hero.title1")}<br />
            <span className="text-dusco-gold-soft">{t("landing.hero.title2")}</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mt-5 max-w-md">
            {t("landing.hero.body")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-dusco-gold text-white font-medium shadow-lg shadow-dusco-gold/25 hover:bg-dusco-gold/90 transition-colors">
              {t("common.getStarted")} <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-white/25 text-white font-medium hover:bg-white/10 transition-colors">
              {t("landing.hero.seeHow")}
            </a>
          </div>
          <p className="text-xs text-white/40 mt-4">{t("landing.hero.demoNote")}</p>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}