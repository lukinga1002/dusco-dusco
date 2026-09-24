import React from "react";
import { Link } from "react-router-dom";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-dusco-cream flex flex-col">
      <div className="px-5 pt-6">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-dusco-gold-soft font-display font-bold">D</span>
          <span className="font-display font-semibold text-lg text-dusco-ink">Dusco</span>
        </Link>
      </div>
      <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto px-5 py-8">
        <div className="mb-7">
          <h1 className="font-display text-3xl font-semibold text-dusco-ink tracking-tight">{title}</h1>
          {subtitle && <p className="text-dusco-ink-soft mt-2">{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="mt-6 text-sm text-dusco-ink-soft text-center">{footer}</div>}
      </div>
    </div>
  );
}