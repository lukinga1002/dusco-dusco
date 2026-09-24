// Formatting helpers for Dusco. Currency is always whole TZS with thousands separators.

export function formatTZS(amount) {
  const n = Math.round(Number(amount) || 0);
  return "TZS " + n.toLocaleString("en-US");
}

export function formatTZSShort(amount) {
  const n = Math.round(Number(amount) || 0);
  return n.toLocaleString("en-US");
}

export function formatNumber(n) {
  return (Number(n) || 0).toLocaleString("en-US");
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
}

export function maskPhone(phone) {
  if (!phone) return "";
  const s = String(phone);
  if (s.length <= 4) return s;
  return s.slice(0, 4) + "•••••" + s.slice(-3);
}

// Validate Tanzanian local phone: 07XXXXXXXX or 06XXXXXXXX or 01XXXXXXXX (10 digits starting 0)
export function isValidTzPhone(phone) {
  const p = String(phone || "").replace(/\s/g, "");
  return /^0\d{9}$/.test(p);
}