import { useT } from "@/lib/i18n";
import React from "react";
import { motion } from "framer-motion";

const ENVELOPES = [
  { name: "Akiba", pct: 50, amt: "250,000", c: "hsl(var(--chart-1))", glow: "hsl(var(--chart-1) / 0.55)", delay: 0 },
  { name: "Karo", pct: 30, amt: "150,000", c: "hsl(var(--chart-2))", glow: "hsl(var(--chart-2) / 0.55)", delay: 0.7 },
  { name: "Safari", pct: 20, amt: "100,000", c: "hsl(var(--chart-4))", glow: "hsl(var(--chart-4) / 0.55)", delay: 1.4 },
];

export default function HeroVisual() {
  const t = useT();
  return (
    <div className="relative h-80 sm:h-96">
      {/* incoming */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-2xl bg-white text-dusco-ink shadow-xl z-10"
        style={{ boxShadow: "0 0 50px -12px hsl(var(--brass) / 0.55)" }}
      >
        <p className="text-[10px] opacity-60 uppercase tracking-wider">{t("landing.hero.sentTo", { number: "DUS-A3K9M2" })}</p>
        <p className="font-display text-xl font-semibold tabular-nums">TZS 500,000</p>
      </motion.div>
      {/* connector lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 380" preserveAspectRatio="none" fill="none">
        <g stroke="rgba(255,255,255,0.14)" strokeWidth="1.5">
          <path d="M200 78 C 150 140, 80 170, 80 236" />
          <path d="M200 78 C 200 150, 200 190, 200 236" />
          <path d="M200 78 C 250 140, 320 170, 320 236" />
        </g>
        <g stroke="hsl(var(--brass))" strokeWidth="1.5" strokeDasharray="4 8" opacity="0.55">
          <path d="M200 78 C 150 140, 80 170, 80 236" />
          <path d="M200 78 C 200 150, 200 190, 200 236" />
          <path d="M200 78 C 250 140, 320 170, 320 236" />
        </g>
      </svg>
      {/* envelopes */}
      <div className="absolute bottom-4 inset-x-0 grid grid-cols-3 gap-3 px-2">
        {ENVELOPES.map((e, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: e.delay }}
            className="rounded-2xl p-3.5"
            style={{ background: e.c, boxShadow: `0 24px 50px -12px ${e.glow}` }}
          >
            <p className="text-[10px] uppercase tracking-wider text-white/80">Bahasha</p>
            <p className="font-display text-sm font-semibold text-white truncate">{e.name}</p>
            <p className="font-display text-lg font-semibold text-white tabular-nums mt-1">TZS {e.amt}</p>
            <p className="text-[10px] text-white/70">{e.pct}%</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}