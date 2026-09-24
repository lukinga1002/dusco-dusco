import React from "react";
import { Button } from "@/components/ui/button";

const inputClass = "mt-1 min-h-11 w-full rounded-xl border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
export default function ActivityFilters({ value, onChange, wallets, walletError, onWalletRetry }) {
  const set = (key, next) => onChange({ ...value, [key]: next });
  return <div className="rounded-2xl border bg-card p-4">
    <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-4">
      <label className="text-xs font-medium">Transaction type<select className={inputClass} value={value.type} onChange={(e) => set("type", e.target.value)}><option value="">All types</option>{["deposit", "withdrawal", "fee", "dividend", "transfer", "penalty"].map((type) => <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>)}</select></label>
      <label className="text-xs font-medium">Bahasha<select className={inputClass} value={value.bahashaId} onChange={(e) => set("bahashaId", e.target.value)}><option value="">All bahashas</option>{wallets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="text-xs font-medium">From date<input type="date" className={inputClass} value={value.startDate} max={value.endDate || undefined} onChange={(e) => set("startDate", e.target.value)} /></label>
      <label className="text-xs font-medium">To date<input type="date" className={inputClass} value={value.endDate} min={value.startDate || undefined} onChange={(e) => set("endDate", e.target.value)} /></label>
    </div>
    {walletError && <div role="alert" className="mt-3 text-xs text-destructive">Could not load bahasha choices. <button type="button" onClick={onWalletRetry} className="min-h-11 underline">Retry</button></div>}
    {Object.values(value).some(Boolean) && <Button variant="ghost" className="mt-3 min-h-11" onClick={() => onChange({ type: "", bahashaId: "", startDate: "", endDate: "" })}>Clear filters</Button>}
  </div>;
}