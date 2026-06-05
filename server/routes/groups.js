const express = require('express');
const { supabase, getUniqueDuscoNumber } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { collectPayment } = require('../services/payment');
const { SETTLEMENT_NETWORK } = require('../services/payment.types');

const router = express.Router();
router.use(authenticateToken);

const COLORS = ['#ED1B24', '#3B82F6', '#16A34A', '#F59E0B', '#8B5CF6', '#EC4899'];

// POST /api/groups — Create group
router.post('/', async (req, res) => {
  try {
    const { name, description, contributionSharesAmount, contributionSocialAmount, contributionFrequency, bahashas, invitePhones } = req.body;
    if (!name) return res.status(400).json({ error: 'Group name is required' });

    const duscoNumber = await getUniqueDuscoNumber();
    const { data: group, error } = await supabase.from('groups').insert({
      name, dusco_number: duscoNumber, admin_user_id: req.userId, description,
      contribution_shares_amount: contributionSharesAmount || 0,
      contribution_social_amount: contributionSocialAmount || 0,
      contribution_frequency: contributionFrequency || 'weekly',
    }).select().single();
    if (error) throw error;

    // Add creator as admin
    await supabase.from('group_members').insert({ group_id: group.id, user_id: req.userId, role: 'admin' });

    // Create group bahashas
    if (bahashas && bahashas.length >= 2) {
      const total = bahashas.reduce((s, b) => s + b.percentage, 0);
      if (Math.abs(total - 100) > 0.01) return res.status(400).json({ error: 'Bahasha percentages must sum to 100%' });
      for (let i = 0; i < bahashas.length; i++) {
        await supabase.from('group_bahashas').insert({
          group_id: group.id, name: bahashas[i].name, percentage: bahashas[i].percentage, color: COLORS[i % COLORS.length],
        });
      }
    }

    // Invite members by phone
    if (invitePhones && invitePhones.length > 0) {
      for (const phone of invitePhones) {
        const { data: user } = await supabase.from('users').select('id').eq('phone', phone).maybeSingle();
        if (user && user.id !== req.userId) {
          await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id, role: 'member', status: 'active' }).catch(() => {});
        }
      }
    }

    res.status(201).json({ id: group.id, name: group.name, duscoNumber: group.dusco_number });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/groups — List user's groups
router.get('/', async (req, res) => {
  try {
    const { data: memberships } = await supabase.from('group_members').select('group_id').eq('user_id', req.userId).eq('status', 'active');
    const groupIds = (memberships || []).map(m => m.group_id);
    if (groupIds.length === 0) return res.json({ groups: [] });

    const { data: groups } = await supabase.from('groups').select('*').in('id', groupIds);
    const result = [];
    for (const g of groups) {
      const { count: memberCount } = await supabase.from('group_members').select('id', { count: 'exact', head: true }).eq('group_id', g.id).eq('status', 'active');
      const { data: gBahashas } = await supabase.from('group_bahashas').select('balance').eq('group_id', g.id);
      const { data: shares } = await supabase.from('group_shares').select('amount').eq('group_id', g.id);
      const socialBalance = (gBahashas || []).reduce((s, b) => s + b.balance, 0);
      const sharesBalance = (shares || []).reduce((s, x) => s + x.amount, 0);
      result.push({
        id: g.id, name: g.name, duscoNumber: g.dusco_number, description: g.description,
        memberCount, totalBalance: socialBalance + sharesBalance, socialBalance, sharesBalance,
        contributionFrequency: g.contribution_frequency,
        contributionSharesAmount: g.contribution_shares_amount,
        contributionSocialAmount: g.contribution_social_amount,
      });
    }
    res.json({ groups: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/groups/:id — Group dashboard
router.get('/:id', async (req, res) => {
  try {
    const gid = req.params.id;
    const { data: membership } = await supabase.from('group_members').select('role').eq('group_id', gid).eq('user_id', req.userId).maybeSingle();
    if (!membership) return res.status(403).json({ error: 'Not a member of this group' });

    const { data: group } = await supabase.from('groups').select('*').eq('id', gid).single();
    const { data: members } = await supabase.from('group_members').select('*, users(name, phone, dusco_number)').eq('group_id', gid).eq('status', 'active');
    const { data: gBahashas } = await supabase.from('group_bahashas').select('*').eq('group_id', gid).order('created_at');
    const { data: shares } = await supabase.from('group_shares').select('user_id, amount, created_at').eq('group_id', gid);
    const { data: recentTxns } = await supabase.from('group_transactions').select('*, group_bahashas(name), users(name)').eq('group_id', gid).order('created_at', { ascending: false }).limit(15);

    const socialBalance = (gBahashas || []).reduce((s, b) => s + b.balance, 0);
    const sharesTotal = (shares || []).reduce((s, x) => s + x.amount, 0);

    // Aggregate shares per member
    const shareSummary = {};
    (shares || []).forEach(s => {
      if (!shareSummary[s.user_id]) shareSummary[s.user_id] = { total: 0, lastDate: null };
      shareSummary[s.user_id].total += s.amount;
      if (!shareSummary[s.user_id].lastDate || s.created_at > shareSummary[s.user_id].lastDate) shareSummary[s.user_id].lastDate = s.created_at;
    });

    res.json({
      group: { id: group.id, name: group.name, duscoNumber: group.dusco_number, description: group.description, contributionFrequency: group.contribution_frequency, contributionSharesAmount: group.contribution_shares_amount, contributionSocialAmount: group.contribution_social_amount },
      userRole: membership.role,
      memberCount: (members || []).length,
      totalBalance: socialBalance + sharesTotal,
      socialBalance, sharesTotal,
      bahashas: (gBahashas || []).map(b => ({ id: b.id, name: b.name, percentage: b.percentage, balance: b.balance, color: b.color, isLocked: b.is_locked, lockUntil: b.lock_until, goalName: b.goal_name, goalAmount: b.goal_amount })),
      members: (members || []).map(m => ({ id: m.user_id, name: m.users?.name, phone: m.users?.phone, role: m.role, sharesTotal: shareSummary[m.user_id]?.total || 0, lastContribution: shareSummary[m.user_id]?.lastDate })),
      recentTransactions: (recentTxns || []).map(t => ({ id: t.id, userId: t.user_id, userName: t.users?.name, bahashaName: t.group_bahashas?.name, type: t.type, amount: t.amount, fee: t.fee, description: t.description, reference: t.reference, createdAt: t.created_at })),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/groups/:id/contribute — Simulate contribution
router.post('/:id/contribute', async (req, res) => {
  try {
    const gid = req.params.id;
    const { type, sourceNetwork } = req.body; // type: shares, social, both

    const { data: group } = await supabase.from('groups').select('*').eq('id', gid).single();
    const { data: membership } = await supabase.from('group_members').select('role').eq('group_id', gid).eq('user_id', req.userId).maybeSingle();
    if (!membership) return res.status(403).json({ error: 'Not a member' });

    const now = new Date().toISOString();
    let sharesAmount = 0, socialAmount = 0;
    const splits = [];

    if (type === 'shares' || type === 'both') {
      sharesAmount = group.contribution_shares_amount;
      await supabase.from('group_shares').insert({ group_id: gid, user_id: req.userId, amount: sharesAmount });
      await supabase.from('group_transactions').insert({ group_id: gid, user_id: req.userId, type: 'share_contribution', amount: sharesAmount, description: 'Share contribution', reference: `SHR-${Date.now()}` });
    }

    if (type === 'social' || type === 'both') {
      socialAmount = group.contribution_social_amount;
      const isSame = sourceNetwork === SETTLEMENT_NETWORK;
      const fee = isSame ? 0 : Math.max(500, Math.round(socialAmount * 0.01));
      const net = socialAmount - fee;

      const { data: gBahashas } = await supabase.from('group_bahashas').select('*').eq('group_id', gid).order('created_at');
      for (const b of gBahashas) {
        const splitAmt = Math.round(net * b.percentage / 100);
        await supabase.from('group_bahashas').update({ balance: b.balance + splitAmt }).eq('id', b.id);
        await supabase.from('group_transactions').insert({ group_id: gid, user_id: req.userId, group_bahasha_id: b.id, type: 'social_contribution', amount: splitAmt, description: `Social fund - ${b.name} (${b.percentage}%)`, reference: `SOC-${Date.now()}-${b.id}` });
        splits.push({ bahashaId: b.id, bahashaName: b.name, percentage: b.percentage, amount: splitAmt, color: b.color });
      }

      if (fee > 0) {
        await supabase.from('group_transactions').insert({ group_id: gid, user_id: req.userId, type: 'social_contribution', amount: fee, fee, description: `Cross-network fee (${sourceNetwork})`, reference: `FEE-SOC-${Date.now()}` });
      }
    }

    res.json({ message: 'Contribution recorded', sharesAmount, socialAmount, splits });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/groups/:id/withdraw — Withdraw from group bahasha
router.post('/:id/withdraw', async (req, res) => {
  try {
    const gid = req.params.id;
    const { bahashaId, amount, destinationPhone, destinationNetwork, purpose } = req.body;

    const { data: membership } = await supabase.from('group_members').select('role').eq('group_id', gid).eq('user_id', req.userId).maybeSingle();
    if (!membership || (membership.role !== 'admin' && membership.role !== 'treasurer')) {
      return res.status(403).json({ error: 'Only admin or treasurer can withdraw' });
    }

    const { data: bahasha } = await supabase.from('group_bahashas').select('*').eq('id', bahashaId).eq('group_id', gid).single();
    if (!bahasha) return res.status(404).json({ error: 'Bahasha not found' });
    if (amount > bahasha.balance) return res.status(400).json({ error: 'Insufficient balance' });

    const fee = Math.max(500, Math.min(Math.round(amount * 0.01), 5000));
    await supabase.from('group_bahashas').update({ balance: bahasha.balance - amount - fee }).eq('id', bahashaId);
    await supabase.from('group_transactions').insert({ group_id: gid, user_id: req.userId, group_bahasha_id: bahashaId, type: 'withdrawal', amount: -amount, fee, description: purpose || `Withdrawal from ${bahasha.name}`, reference: `GWD-${Date.now()}` });

    res.json({ message: 'Withdrawal processed (auto-approved for demo)', amount, fee, bahashaName: bahasha.name, note: 'In production, this requires member approval' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/groups/:id/members
router.get('/:id/members', async (req, res) => {
  try {
    const { data: members } = await supabase.from('group_members').select('*, users(name, phone)').eq('group_id', req.params.id).eq('status', 'active');
    const { data: shares } = await supabase.from('group_shares').select('user_id, amount, created_at').eq('group_id', req.params.id);

    const shareSummary = {};
    (shares || []).forEach(s => {
      if (!shareSummary[s.user_id]) shareSummary[s.user_id] = { total: 0, lastDate: null };
      shareSummary[s.user_id].total += s.amount;
      if (!shareSummary[s.user_id].lastDate || s.created_at > shareSummary[s.user_id].lastDate) shareSummary[s.user_id].lastDate = s.created_at;
    });

    res.json({
      members: (members || []).map(m => ({
        id: m.user_id, name: m.users?.name, phone: m.users?.phone, role: m.role,
        sharesTotal: shareSummary[m.user_id]?.total || 0, lastContribution: shareSummary[m.user_id]?.lastDate,
      })).sort((a, b) => b.sharesTotal - a.sharesTotal),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/groups/:id/transactions
router.get('/:id/transactions', async (req, res) => {
  try {
    const { type, limit = 50, offset = 0 } = req.query;
    let query = supabase.from('group_transactions').select('*, group_bahashas(name), users(name)', { count: 'exact' }).eq('group_id', req.params.id);
    if (type) query = query.eq('type', type);
    const { data, count } = await query.order('created_at', { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);
    res.json({ total: count || 0, transactions: (data || []).map(t => ({ id: t.id, userName: t.users?.name, bahashaName: t.group_bahashas?.name, type: t.type, amount: t.amount, fee: t.fee, description: t.description, createdAt: t.created_at })) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/groups/:id/invite
router.post('/:id/invite', async (req, res) => {
  try {
    const { phone } = req.body;
    const { data: membership } = await supabase.from('group_members').select('role').eq('group_id', req.params.id).eq('user_id', req.userId).maybeSingle();
    if (!membership || membership.role !== 'admin') return res.status(403).json({ error: 'Only admin can invite' });

    const { data: user } = await supabase.from('users').select('id, name').eq('phone', phone).maybeSingle();
    if (!user) return res.status(404).json({ error: 'User not found. They must register on Dusco first.' });

    const { error } = await supabase.from('group_members').insert({ group_id: req.params.id, user_id: user.id });
    if (error) return res.status(409).json({ error: 'User is already a member' });
    res.json({ message: `${user.name} added to group` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
