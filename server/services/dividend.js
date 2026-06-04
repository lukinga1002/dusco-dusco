/**
 * Dividend Calculation Service
 *
 * Calculates and distributes annual dividends based on:
 * - 8% annual return on pooled float (T-bill proxy)
 * - 70/30 split: 70% Dusco, 30% users
 * - User share proportional to average balance
 */

const { supabase } = require('../db/database');
const { bulkPayout } = require('./payment');

async function calculateDividendProjection(userId) {
  const { data: bahashas } = await supabase
    .from('bahashas')
    .select('id, name, balance, color')
    .eq('user_id', userId);

  const totalBalance = bahashas.reduce((sum, b) => sum + b.balance, 0);
  const annualReturnRate = 0.08;
  const userShare = 0.30;

  const estimatedAnnualReturn = Math.round(totalBalance * annualReturnRate);
  const userDividend = Math.round(estimatedAnnualReturn * userShare);

  const perBahasha = bahashas.map(b => ({
    id: b.id,
    name: b.name,
    balance: b.balance,
    color: b.color,
    shareOfTotal: totalBalance > 0 ? (b.balance / totalBalance * 100).toFixed(1) : 0,
    projectedDividend: totalBalance > 0 ? Math.round(userDividend * (b.balance / totalBalance)) : 0,
  }));

  const largestBahasha = bahashas.reduce((max, b) => b.balance > (max?.balance || 0) ? b : max, null);

  return {
    totalBalance,
    annualReturnRate: `${(annualReturnRate * 100).toFixed(0)}%`,
    estimatedAnnualReturn,
    profitSplit: { company: '70%', users: '30%' },
    projectedUserDividend: userDividend,
    projectedMonthlyEquivalent: Math.round(userDividend / 12),
    defaultRecipientBahasha: largestBahasha ? { id: largestBahasha.id, name: largestBahasha.name } : null,
    perBahasha,
  };
}

async function simulateDividendDistribution() {
  const { data: users } = await supabase.from('users').select('id, name, phone');
  const payouts = [];

  for (const user of users) {
    const { data: bahashas } = await supabase
      .from('bahashas')
      .select('id, name, balance')
      .eq('user_id', user.id)
      .order('balance', { ascending: false });

    if (!bahashas || bahashas.length === 0) continue;

    const totalBalance = bahashas.reduce((s, b) => s + b.balance, 0);
    if (totalBalance <= 0) continue;

    const dividend = Math.round(totalBalance * 0.08 * 0.30);
    const targetBahasha = bahashas[0]; // largest balance

    // Credit the dividend
    await supabase.from('bahashas').update({ balance: targetBahasha.balance + dividend }).eq('id', targetBahasha.id);

    // Record transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      bahasha_id: targetBahasha.id,
      type: 'dividend',
      amount: dividend,
      reference: `DIV-${Date.now()}-${user.id}`,
      description: `Annual dividend credited to ${targetBahasha.name}`,
    });

    // Record dividend
    const now = new Date();
    const yearAgo = new Date(now);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    await supabase.from('dividends').insert({
      user_id: user.id,
      bahasha_id: targetBahasha.id,
      amount: dividend,
      yield_rate: 0.08,
      period_start: yearAgo.toISOString().split('T')[0],
      period_end: now.toISOString().split('T')[0],
    });

    // Notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Dividend credited',
      message: `TZS ${dividend.toLocaleString()} dividend credited to ${targetBahasha.name}`,
      type: 'dividend',
    });

    payouts.push({ user_id: user.id, amount: dividend, destination: user.phone });
  }

  // Mock bulk payout via GCA Pay
  if (payouts.length > 0) {
    await bulkPayout({ payouts });
  }

  return { distributed: payouts.length, payouts };
}

module.exports = { calculateDividendProjection, simulateDividendDistribution };
