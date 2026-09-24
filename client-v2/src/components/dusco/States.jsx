import React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center px-6 py-14", className)}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-dusco-sand flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-dusco-ink-soft" />
        </div>
      )}
      <h3 className="font-display text-lg text-dusco-ink">{title}</h3>
      {description && <p className="text-sm text-dusco-ink-mute mt-1.5 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center px-6 py-14", className)}>
      <div className="w-14 h-14 rounded-2xl bg-dusco-red-soft flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-dusco-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="font-display text-lg text-dusco-ink">Something went wrong</h3>
      <p className="text-sm text-dusco-ink-mute mt-1.5 max-w-xs">{message || "Please try again."}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 px-5 py-2.5 rounded-xl bg-dusco-ink text-white text-sm font-medium hover:bg-dusco-ink/90 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-xl bg-dusco-sand", className)} />;
}