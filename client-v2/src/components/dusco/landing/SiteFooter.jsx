import React from "react";
import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="max-w-3xl mx-auto px-5 py-12">
      <div className="flex items-center gap-2.5 mb-6">
        <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-dusco-gold-soft font-display font-bold">D</span>
        <span className="font-display font-semibold text-lg">Dusco</span>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-dusco-ink-soft">
        <Link to="/privacy" className="hover:text-dusco-ink">Privacy Notice</Link>
        <Link to="/terms" className="hover:text-dusco-ink">Terms</Link>
        <Link to="/login" className="hover:text-dusco-ink">Log in</Link>
        <Link to="/register" className="hover:text-dusco-ink">Get started</Link>
      </div>
      <p className="text-xs text-dusco-ink-mute mt-6">
        © {new Date().getFullYear()} Larson Consulting. Dusco is a demonstration product. Money movement is simulated.
      </p>
    </footer>
  );
}