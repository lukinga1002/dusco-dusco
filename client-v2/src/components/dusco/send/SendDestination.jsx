import React from "react";
import { Input } from "@/components/ui/input";
import { BANK_NETWORKS, MOBILE_NETWORKS } from "@/components/dusco/send/sendMoneyRules";

export default function SendDestination({ form, onChange }) {
  const bank = form.destinationType === "bank";
  const networks = bank ? BANK_NETWORKS : MOBILE_NETWORKS;
  return <div className="space-y-4 border-t pt-5">
    <fieldset><legend className="mb-2 text-sm font-medium">Send to</legend><div className="grid grid-cols-2 gap-3">{[{ value: "mobile", label: "Mobile money" }, { value: "bank", label: "Bank account" }].map((item) => <label key={item.value} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm ${form.destinationType === item.value ? "border-primary bg-accent" : "bg-card"}`}><input type="radio" name="send-destination-type" value={item.value} checked={form.destinationType === item.value} className="accent-primary" onChange={() => onChange({ ...form, destinationType: item.value, destinationPhone: "", destinationNetwork: "" })} />{item.label}</label>)}</div></fieldset>
    <div><label htmlFor="send-network" className="mb-2 block text-sm font-medium">{bank ? "Recipient’s bank" : "Recipient’s network"}</label><select id="send-network" value={form.destinationNetwork} onChange={(event) => onChange({ ...form, destinationNetwork: event.target.value })} className="min-h-12 w-full rounded-xl border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option value="" disabled>{bank ? "Choose bank" : "Choose network"}</option>{networks.map((network) => <option key={network} value={network}>{network}</option>)}</select></div>
    <label className="block text-sm font-medium">{bank ? "Recipient’s account number" : "Recipient’s phone number"}<Input type={bank ? "text" : "tel"} inputMode={bank ? "numeric" : "tel"} autoComplete="off" className="mt-2 min-h-12" placeholder={bank ? "Enter account number" : "0712345678"} value={form.destinationPhone} maxLength={bank ? 34 : 20} onChange={(event) => onChange({ ...form, destinationPhone: event.target.value })} /></label>
  </div>;
}