const express = require('express');
const { supabase } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { collectPayment, disburseFunds } = require('../services/payment');
const { SETTLEMENT_NETWORK } = require('../services/payment.types');

const router = express.Router();
router.use(authenticateToken);

function calculateWithdrawalFee(amount, heldSince) {
  if (heldSince) {
    const heldDays = Math.floor((Date.now() - new Date(heldSince).getTime()) / (1000 * 60 * 60 * 24));
    if (heldDays >= 90) return 0;
  }
  return Math.max(500, Math.min(Math.round(amount * 0.01), 5000));
}

router.post('/deposit', async (req, res) => {
  try {
    const { amount, sourceNetwork, senderPhone, external } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Amount must be positive' });
    if (!sourceNetwork) return res.status(400).json({ error: 'Source network is required' });

    const { data: user } = await supabase.from('users').select('dusco_number').eq('id', req.userId).single();
    const { data: bahashas } = await supabase.from('bahashas').select('*').eq('user_id', req.userId).order('created_at');
    if (!bahashas.length) return res.status(400).json({ error: 'No bahashas configured' });

    // Process via payment service (external = money sent to the Dusco number from another app)
    const payment = await collectPayment({ amount, source_network: sourceNetwork, source_phone: senderPhone || '0700000000', dusco_number: user.dusco_number });
    const netAmount = payment.net_amount;

    const splits = bahashas.map(b => ({
      bahashaId: b.id, bahashaName: b.name, percentage: b.percentage, color: b.color,
      amount: Math.round(netAmount * (b.percentage / 100)),
    }));
    const splitTotal = splits.reduce((s, x) => s + x.amount, 0);
    if (splitTotal !== netAmount && splits.length > 0) splits[0].amount += netAmount - splitTotal;

    const now = new Date().toISOString();
    for (const split of splits) {
      await supabase.from('bahashas').update({ balance: bahashas.find(b => b.id === split.bahashaId).balance + split.amount }).eq('id', split.bahashaId);
      await supabase.from('transactions').insert({
        user_id: req.userId, bahasha_id: split.bahashaId, type: 'deposit', amount: split.amount,
        source_network: sourceNetwork, reference: payment.transaction_id,
        description: `Deposit - ${split.bahashaName} (${split.percentage}%)`, held_since: now,
      });
    }

    if (payment.cross_network_fee > 0) {
      await supabase.from('transactions').insert({
        user_id: req.userId, type: 'fee', amount: payment.cross_network_fee,
        description: `Cross-network fee (${sourceNetwork})`, reference: `FEE-${payment.transaction_id}`,
      });
    }

    const splitDesc = splits.map(s => `${s.bahashaName} TZS ${s.amount.toLocaleString()}`).join(' | ');
    const sourceLabel = external
      ? `received from ${senderPhone || 'an external account'} via ${sourceNetwork}`
      : `deposited via ${sourceNetwork}`;
    await supabase.from('notifications').insert({
      user_id: req.userId, title: external ? 'Money received' : 'Deposit received',
      message: `TZS ${amount.toLocaleString()} ${sourceLabel}. Auto-split: ${splitDesc}`, type: 'deposit',
    });

    res.json({ message: 'Deposit processed', grossAmount: amount, crossNetworkFee: payment.cross_network_fee, netAmount, sourceNetwork, senderPhone: senderPhone || null, external: !!external, transactionId: payment.transaction_id, splits });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/withdraw', async (req, res) => {
  try {
    const { bahashaId, amount, destinationPhone, destinationNetwork } = req.body;
    if (!bahashaId || !amount || amount <= 0) return res.status(400).json({ error: 'Bahasha ID and positive amount required' });
    if (!destinationPhone || !destinationNetwork) return res.status(400).json({ error: 'Destination phone and network required' });

    const { data: bahasha } = await supabase.from('bahashas').select('*').eq('id', bahashaId).eq('user_id', req.userId).single();
    if (!bahasha) return res.status(404).json({ error: 'Bahasha not found' });
    if (bahasha.is_locked && new Date(bahasha.lock_until) > new Date()) {
      return res.status(400).json({ error: `Bahasha locked until ${bahasha.lock_until}. Unlock early with 2% penalty.` });
    }
    if (amount > bahasha.balance) return res.status(400).json({ error: `Insufficient balance. Available: TZS ${bahasha.balance.toLocaleString()}` });

    const { data: earliest } = await supabase.from('transactions').select('held_since').eq('bahasha_id', bahashaId).eq('type', 'deposit').not('held_since', 'is', null).order('held_since').limit(1);
    const withdrawalFee = calculateWithdrawalFee(amount, earliest?.[0]?.held_since);
    const feeWaived = withdrawalFee === 0 && earliest?.[0]?.held_since;

    if (withdrawalFee >= amount) return res.status(400).json({ error: `Amount too small — it must be more than the TZS ${withdrawalFee.toLocaleString()} fee.` });

    // Fee-inclusive: `amount` leaves the bahasha; the fee is taken out of it,
    // and the recipient receives the remainder.
    const netSent = amount - withdrawalFee;
    const payment = await disburseFunds({ amount: netSent, destination_network: destinationNetwork, destination_phone: destinationPhone, bahasha_id: bahashaId });

    await supabase.from('bahashas').update({ balance: bahasha.balance - amount }).eq('id', bahashaId);

    await supabase.from('transactions').insert({
      user_id: req.userId, bahasha_id: bahashaId, type: 'withdrawal', amount: -amount, fee: withdrawalFee,
      destination_phone: destinationPhone, destination_network: destinationNetwork, reference: payment.transaction_id,
      description: `Sent TZS ${netSent.toLocaleString()} from ${bahasha.name}${feeWaived ? ' (fee waived - 90-day bonus)' : ` · fee TZS ${withdrawalFee.toLocaleString()}`}`,
    });

    if (withdrawalFee > 0) {
      await supabase.from('transactions').insert({
        user_id: req.userId, bahasha_id: bahashaId, type: 'fee', amount: withdrawalFee,
        description: 'Withdrawal fee (deducted from amount)', reference: `FEE-${payment.transaction_id}`,
      });
    }

    await supabase.from('notifications').insert({
      user_id: req.userId, title: 'Withdrawal completed',
      message: `TZS ${netSent.toLocaleString()} sent from ${bahasha.name} to ${destinationPhone} (${destinationNetwork}). Fee: TZS ${withdrawalFee.toLocaleString()}${feeWaived ? ' (waived)' : ''} · TZS ${amount.toLocaleString()} taken from bahasha`,
      type: 'withdrawal',
    });

    res.json({ message: 'Withdrawal processed', amount, netSent, withdrawalFee, feeWaived: !!feeWaived, destination: `${destinationPhone} (${destinationNetwork})`, bahashaName: bahasha.name, remainingBalance: bahasha.balance - amount, transactionId: payment.transaction_id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', async (req, res) => {
  try {
    const { bahashaId, type, startDate, endDate, limit = 50, offset = 0 } = req.query;
    let query = supabase.from('transactions').select('*, bahashas(name)', { count: 'exact' }).eq('user_id', req.userId);

    if (bahashaId) query = query.eq('bahasha_id', bahashaId);
    if (type) query = query.eq('type', type);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data, count } = await query.order('created_at', { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);

    res.json({
      total: count || 0, limit: Number(limit), offset: Number(offset),
      transactions: (data || []).map(t => ({
        id: t.id, bahashaId: t.bahasha_id, bahashaName: t.bahashas?.name || null,
        type: t.type, amount: t.amount, fee: t.fee, sourceNetwork: t.source_network,
        destination: t.destination_phone ? `${t.destination_phone} (${t.destination_network})` : null,
        reference: t.reference, description: t.description, createdAt: t.created_at,
      })),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/fee-preview', async (req, res) => {
  try {
    const { amount, type, sourceNetwork, bahashaId } = req.query;
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: 'Valid amount required' });

    if (type === 'deposit') {
      const isSame = sourceNetwork === SETTLEMENT_NETWORK;
      const fee = isSame ? 0 : Math.max(500, Math.round(amt * 0.01));
      return res.json({ fee, feeWaived: fee === 0, netAmount: amt - fee });
    }
    if (type === 'withdrawal') {
      const { data: earliest } = await supabase.from('transactions').select('held_since').eq('bahasha_id', bahashaId).eq('type', 'deposit').not('held_since', 'is', null).order('held_since').limit(1);
      const fee = calculateWithdrawalFee(amt, earliest?.[0]?.held_since);
      return res.json({ fee, feeWaived: fee === 0 && !!earliest?.[0]?.held_since, feeWaivedReason: fee === 0 ? '90-day savings bonus' : null });
    }
    res.status(400).json({ error: 'Type must be deposit or withdrawal' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
