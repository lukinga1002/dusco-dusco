const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../db/database');
const { authenticateAdmin, JWT_SECRET } = require('../middleware/auth');
const { simulateDividendDistribution } = require('../services/dividend');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    // v2: admin/dusco2024
    if (username !== 'admin' || password !== 'dusco2024') {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign({ isAdmin: true }, JWT_SECRET, { expiresIn: '4h' });
    res.json({ token, message: 'Admin authenticated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.use(authenticateAdmin);

router.get('/dashboard', async (req, res) => {
  try {
    const { count: totalUsers } = await supabase.from('users').select('id', { count: 'exact', head: true });
    const { count: totalBahashas } = await supabase.from('bahashas').select('id', { count: 'exact', head: true });
    const { data: balances } = await supabase.from('bahashas').select('balance');
    const totalFunds = (balances || []).reduce((s, b) => s + b.balance, 0);

    const { data: categories } = await supabase.from('bahashas').select('name, balance');
    const categoryMap = {};
    (categories || []).forEach(c => {
      if (!categoryMap[c.name]) categoryMap[c.name] = { name: c.name, count: 0, totalBalance: 0 };
      categoryMap[c.name].count++;
      categoryMap[c.name].totalBalance += c.balance;
    });

    const { data: fees } = await supabase.from('transactions').select('amount, description').eq('type', 'fee');
    const crossNetworkFees = (fees || []).filter(f => f.description?.includes('Cross-network')).reduce((s, f) => s + f.amount, 0);
    const withdrawalFees = (fees || []).filter(f => f.description?.includes('Withdrawal')).reduce((s, f) => s + f.amount, 0);
    const totalFeeRevenue = (fees || []).reduce((s, f) => s + f.amount, 0);

    const annualRate = 0.08;
    const simulatedReturn = Math.round(totalFunds * annualRate);

    const { data: txStats } = await supabase.from('transactions').select('type, amount');
    const statMap = {};
    (txStats || []).forEach(t => {
      if (!statMap[t.type]) statMap[t.type] = { type: t.type, count: 0, volume: 0 };
      statMap[t.type].count++;
      statMap[t.type].volume += Math.abs(t.amount);
    });

    const { data: dividendsPaid } = await supabase.from('dividends').select('amount');
    const totalDividendsPaid = (dividendsPaid || []).reduce((s, d) => s + d.amount, 0);

    res.json({
      overview: { totalUsers: totalUsers || 0, totalBahashas: totalBahashas || 0, totalFunds, totalFundsFormatted: `TZS ${totalFunds.toLocaleString()}` },
      categoryBreakdown: Object.values(categoryMap).sort((a, b) => b.count - a.count),
      revenue: { crossNetworkFees, withdrawalFees, totalFeeRevenue },
      floatInvestment: {
        totalFloat: totalFunds, annualReturnRate: '8%', simulatedAnnualReturn: simulatedReturn,
        profitSplit: { company: '70%', users: '30%' },
        companyProfit: Math.round(simulatedReturn * 0.70), userDividendPool: Math.round(simulatedReturn * 0.30),
        netCompanyRevenue: Math.round(totalFeeRevenue + simulatedReturn * 0.70),
        totalDividendsPaid,
      },
      transactionStats: Object.values(statMap),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/users', async (req, res) => {
  try {
    const { data: users } = await supabase.from('users').select('id, phone, name, dusco_number, is_verified, created_at').order('created_at', { ascending: false });
    const result = [];
    for (const u of users) {
      const { data: bahashas } = await supabase.from('bahashas').select('balance').eq('user_id', u.id);
      result.push({ ...u, duscoNumber: u.dusco_number, isVerified: u.is_verified, createdAt: u.created_at, bahashaCount: bahashas.length, totalBalance: bahashas.reduce((s, b) => s + b.balance, 0) });
    }
    res.json({ users: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/users/:id', async (req, res) => {
  try {
    const { data: user } = await supabase.from('users').select('id, phone, name, dusco_number, is_verified, created_at').eq('id', req.params.id).single();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { data: bahashas } = await supabase.from('bahashas').select('*').eq('user_id', user.id);
    const { data: txns } = await supabase.from('transactions').select('*, bahashas(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);

    res.json({
      user: { id: user.id, phone: user.phone, name: user.name, duscoNumber: user.dusco_number, isVerified: user.is_verified, createdAt: user.created_at },
      bahashas: (bahashas || []).map(b => ({ id: b.id, name: b.name, percentage: b.percentage, balance: b.balance, color: b.color, isLocked: b.is_locked, lockUntil: b.lock_until })),
      recentTransactions: (txns || []).map(t => ({ id: t.id, type: t.type, amount: t.amount, fee: t.fee, bahashaName: t.bahashas?.name, description: t.description, createdAt: t.created_at })),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/transactions', async (req, res) => {
  try {
    const { type, userId, limit = 100, offset = 0 } = req.query;
    let query = supabase.from('transactions').select('*, bahashas(name), users!inner(name, dusco_number)', { count: 'exact' });
    if (type) query = query.eq('type', type);
    if (userId) query = query.eq('user_id', userId);

    const { data, count } = await query.order('created_at', { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);

    res.json({
      total: count || 0,
      transactions: (data || []).map(t => ({
        id: t.id, userId: t.user_id, userName: t.users?.name, duscoNumber: t.users?.dusco_number,
        bahashaName: t.bahashas?.name, type: t.type, amount: t.amount, fee: t.fee,
        sourceNetwork: t.source_network, destination: t.destination_phone ? `${t.destination_phone} (${t.destination_network})` : null,
        reference: t.reference, description: t.description, createdAt: t.created_at,
      })),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/dividends/distribute', async (req, res) => {
  try {
    const result = await simulateDividendDistribution();
    res.json({ message: `Dividends distributed to ${result.distributed} users`, ...result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
