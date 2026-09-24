import { SETTLEMENT_NETWORK } from "@/components/dusco/NetworkSelect";

export function canDeposit(wallets) {
  return wallets.length >= 2 && wallets.length <= 6 && wallets.every((wallet) => Number.isFinite(Number(wallet.percentage)) && Number(wallet.percentage) >= 0 && Number(wallet.percentage) <= 100) && wallets.reduce((sum, wallet) => sum + Number(wallet.percentage), 0) === 100;
}

export function allocationSignature(wallets) {
  return JSON.stringify(wallets.map((wallet) => [String(wallet.id), wallet.name, Number(wallet.percentage)]).sort((a, b) => a[0].localeCompare(b[0])));
}

export function depositPreview(amount, network, wallets) {
  const gross = Number(amount);
  const fee = network === SETTLEMENT_NETWORK ? 0 : Math.max(500, Math.round(gross / 100));
  const net = gross - fee;
  const splits = wallets.map((wallet) => {
    const exact = Math.max(0, net) * Number(wallet.percentage) / 100;
    return { bahashaId: wallet.id, bahashaName: wallet.name, percentage: Number(wallet.percentage), amount: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  const unallocated = Math.max(0, net) - splits.reduce((sum, split) => sum + split.amount, 0);
  const order = splits.map((_, index) => index).filter((index) => splits[index].percentage > 0).sort((a, b) => splits[b].remainder - splits[a].remainder);
  if (canDeposit(wallets)) for (let index = 0; index < unallocated; index++) splits[order[index % order.length]].amount++;
  return { gross, fee, net, splits };
}