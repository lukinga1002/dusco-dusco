import React from "react";
import { Link } from "react-router-dom";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-dusco-ink/85 backdrop-blur-md border-b border-white/10">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-dusco-gold flex items-center justify-center text-dusco-ink font-display font-bold">D</span>
          <span className="font-display font-semibold text-lg text-white">Dusco</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-white/75 hover:text-white transition-colors">Log in</Link>
          <Link to="/register" className="px-4 py-2 rounded-xl bg-dusco-gold text-white text-sm font-medium hover:bg-dusco-gold/90 transition-colors">Get started</Link>
        </div>
      </div>
    </header>
  );
}