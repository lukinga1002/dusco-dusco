import React from "react";

export const NETWORKS = [
  "M-Pesa",
  "Mixx by Yas (Tigo Pesa)",
  "Airtel Money",
  "Halotel",
  "Azam Pesa",
  "CRDB",
  "NMB",
  "Selcom",
];

// The settlement network — deposits from this network are free.
export const SETTLEMENT_NETWORK = "M-Pesa";

export default function NetworkSelect({ value, onChange, className, id, placeholder = "Select network" }) {
  return (
    <select
      id={id}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      <option value="" disabled>{placeholder}</option>
      {NETWORKS.map((n) => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  );
}