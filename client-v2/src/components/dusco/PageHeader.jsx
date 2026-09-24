import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PageHeader({ title, subtitle, back = true, right }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 mb-5">
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white border border-dusco-line flex items-center justify-center text-dusco-ink-soft hover:bg-dusco-sand transition-colors shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-xl font-semibold text-dusco-ink leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-sm text-dusco-ink-mute mt-0.5 truncate">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}