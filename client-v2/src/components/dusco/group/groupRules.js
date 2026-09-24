import { NETWORKS } from "@/components/dusco/NetworkSelect";
import { isValidTzPhone } from "@/lib/duscoFormat";

export const GROUP_FREQUENCIES = ["daily", "weekly", "monthly"];

export const CONTRIBUTION_TYPES = [
  { value: "shares", label: "Shares", blurb: "Goes to your tracked member shares." },
  { value: "social", label: "Social fund", blurb: "Splits across the group’s bahashas." },
  { value: "both", label: "Shares + social fund", blurb: "One contribution, both pools." },
];

export const ROLE_LABELS = { admin: "Admin", treasurer: "Treasurer", member: "Member" };

export const canWithdraw = (role) => role === "admin" || role === "treasurer";
export const canInvite = (role) => role === "admin";

export function roleNotice(role) {
  if (role === "admin") return "";
  if (role === "treasurer") return "You can withdraw because you are the treasurer. Only the group admin can invite members.";
  return "Members contribute and watch the ledger. Only the group admin or treasurer can withdraw, and only the admin can invite.";
}

export function sumPercent(bahashas) {
  return bahashas.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0);
}

export function contributionTotal(type, group) {
  const shares = Number(group.contributionSharesAmount) || 0;
  const social = Number(group.contributionSocialAmount) || 0;
  if (type === "shares") return shares;
  if (type === "social") return social;
  return shares + social;
}

export function inviteInputError(phone) {
  if (!isValidTzPhone(phone)) return "Enter a Tanzanian number, e.g. 0712345678.";
  return "";
}

export function friendlyInviteError(message) {
  const text = String(message || "");
  if (/not found|register/i.test(text)) return "That person isn’t on Dusco yet. Ask them to register with this number first, then invite them again.";
  return text;
}

export const GROUP_NETWORKS = NETWORKS;