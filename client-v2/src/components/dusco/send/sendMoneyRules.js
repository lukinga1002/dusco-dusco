import { api } from "@/lib/duscoApi";
import { NETWORKS } from "@/components/dusco/NetworkSelect";
import { isValidTzPhone } from "@/lib/duscoFormat";

export const BANK_NETWORKS = ["CRDB", "NMB"];
export const MOBILE_NETWORKS = NETWORKS.filter((network) => !BANK_NETWORKS.includes(network));

export function sourceError(wallet, amount) {
  if (!wallet) return "Choose a bahasha to send from.";
  if (wallet.isLocked) return "This bahasha is locked. Manage your bahashas to review the unlock terms first.";
  if (!Number.isSafeInteger(amount) || amount <= 0) return "Enter a positive amount in whole Tanzanian shillings.";
  if (!Number.isFinite(Number(wallet.balance)) || amount > Number(wallet.balance)) return "This bahasha does not have enough available money for that amount.";
  return "";
}

export function destinationError(form) {
  const networks = form.destinationType === "bank" ? BANK_NETWORKS : MOBILE_NETWORKS;
  if (!networks.includes(form.destinationNetwork)) return "Choose a destination network or bank.";
  const number = form.destinationPhone.replace(/\s/g, "");
  if (form.destinationType === "bank" && !/^\d{1,34}$/.test(number)) return "Enter the recipient’s bank account number using digits only.";
  if (form.destinationType !== "bank" && !isValidTzPhone(number)) return "Enter a Tanzanian phone number, such as 0712345678.";
  return "";
}

export async function fetchSendFee({ bahashaId, amount }) {
  const result = await api.feePreview({ bahashaId, amount });
  const fee = Number(result.fee);
  if (result.fee === null || result.fee === undefined || result.fee === "" || !Number.isFinite(fee) || fee < 0 || (result.feeWaived === true && fee !== 0)) throw new Error("Dusco could not confirm the fee. Refresh the preview before sending.");
  return { ...result, fee, feeWaived: result.feeWaived === true };
}