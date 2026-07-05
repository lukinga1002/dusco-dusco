/**
 * Incoming-collection handler.
 *
 * When money is collected into a Dusco number — whether triggered in-app or pushed to us
 * by GCA Pay via webhook — this is the single place that applies it: compute the
 * cross-network fee, split the net across the user's bahashas, write the ledger
 * transactions, and notify. Both `routes/transactions.js` (in-app) and
 * `routes/webhooks.js` (GCA Pay callback) call this so the behaviour is identical.
 */

const { supabase } = require('../db/database');
const { SETTLEMENT_NETWORK } = require('./payment.types');

function crossNetworkFee(amount, sourceNetwork) {
  return sourceNetwork === SETTLEMENT_NETWORK ? 0 : Math.max(500, Math.round(amount * 0.01));
}

/**
 * Apply a collected payment to a user's bahashas.
 * @param {object} p
 * @param {number} p.userId            resolved Dusco user id
 * @param {number} p.amount            gross amount collected
 * @param {string} p.sourceNetwork     e.g. "M-Pesa"
 * @param {string} [p.senderPhone]     payer MSISDN (optional; minimise storage)
 * @param {string} p.reference         provider transaction id / our idempotency ref
 * @param {boolean} [p.external]       true when pushed to our Dusco number externally
 * @returns {Promise<{grossAmount,crossNetworkFee,netAmount,splits}>}
 */
async function applyIncomingCollection({ userId, amount, sourceNetwork, senderPhone, reference, external = true }) {
  const { data: bahashas } = await supabase
    .from('bahashas').select('*').eq('user_id', userId).order('created_at');
  if (!bahashas || bahashas.length === 0) {
    throw new Error('No bahashas configured for this Dusco number');
  }

  const fee = crossNetworkFee(amount, sourceNetwork);
  const netAmount = amount - fee;

  const splits = bahashas.map(b => ({
    bahashaId: b.id, bahashaName: b.name, percentage: b.percentage, color: b.color,
    amount: Math.round(netAmount * (b.percentage / 100)),
  }));
  // Fix rounding so the parts sum exactly to the net
  const splitTotal = splits.reduce((s, x) => s + x.amount, 0);
  if (splitTotal !== netAmount && splits.length > 0) splits[0].amount += netAmount - splitTotal;

  const now = new Date().toISOString();
  for (const split of splits) {
    const current = bahashas.find(b => b.id === split.bahashaId).balance;
    await supabase.from('bahashas').update({ balance: current + split.amount }).eq('id', split.bahashaId);
    await supabase.from('transactions').insert({
      user_id: userId, bahasha_id: split.bahashaId, type: 'deposit', amount: split.amount,
      source_network: sourceNetwork, reference,
      description: `Deposit - ${split.bahashaName} (${split.percentage}%)`, held_since: now,
    });
  }

  if (fee > 0) {
    await supabase.from('transactions').insert({
      user_id: userId, type: 'fee', amount: fee,
      description: `Cross-network fee (${sourceNetwork})`, reference: `FEE-${reference}`,
    });
  }

  const splitDesc = splits.map(s => `${s.bahashaName} TZS ${s.amount.toLocaleString()}`).join(' | ');
  const sourceLabel = external
    ? `received from ${senderPhone || 'an external account'} via ${sourceNetwork}`
    : `deposited via ${sourceNetwork}`;
  await supabase.from('notifications').insert({
    user_id: userId, title: external ? 'Money received' : 'Deposit received',
    message: `TZS ${amount.toLocaleString()} ${sourceLabel}. Auto-split: ${splitDesc}`, type: 'deposit',
  });

  return { grossAmount: amount, crossNetworkFee: fee, netAmount, splits };
}

module.exports = { applyIncomingCollection, crossNetworkFee };
