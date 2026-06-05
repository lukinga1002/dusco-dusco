const express = require('express');
const { supabase } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

const BAHASHA_COLORS = ['#ED1B24', '#3B82F6', '#16A34A', '#F59E0B', '#8B5CF6', '#EC4899'];

router.get('/', async (req, res) => {
  try {
    const { data: bahashas } = await supabase.from('bahashas').select('*').eq('user_id', req.userId).order('created_at');
    const totalBalance = bahashas.reduce((sum, b) => sum + b.balance, 0);
    res.json({
      totalBalance,
      bahashas: bahashas.map(b => ({
        id: b.id, name: b.name, percentage: b.percentage, balance: b.balance, color: b.color,
        isLocked: b.is_locked, lockUntil: b.lock_until, goalName: b.goal_name, goalAmount: b.goal_amount, createdAt: b.created_at,
      })),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, percentage } = req.body;
    if (!name || percentage === undefined) return res.status(400).json({ error: 'Name and percentage are required' });

    const { data: existing } = await supabase.from('bahashas').select('id, percentage').eq('user_id', req.userId);
    if (existing.length >= 6) return res.status(400).json({ error: 'Maximum 6 bahashas allowed' });

    const currentTotal = existing.reduce((sum, b) => sum + b.percentage, 0);
    if (currentTotal + percentage > 100.01) return res.status(400).json({ error: `Adding ${percentage}% would exceed 100%` });

    const color = BAHASHA_COLORS[existing.length % BAHASHA_COLORS.length];
    const { data, error } = await supabase.from('bahashas')
      .insert({ user_id: req.userId, name, percentage, color })
      .select().single();
    if (error) throw error;

    res.status(201).json({ id: data.id, name: data.name, percentage: data.percentage, balance: 0, color: data.color, isLocked: false, lockUntil: null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, percentage, lockUntil, unlock, goalName, goalAmount } = req.body;
    const { data: bahasha } = await supabase.from('bahashas').select('*').eq('id', req.params.id).eq('user_id', req.userId).single();
    if (!bahasha) return res.status(404).json({ error: 'Bahasha not found' });

    // Early unlock with penalty
    if (unlock && bahasha.is_locked) {
      const now = new Date();
      const lockEnd = new Date(bahasha.lock_until);
      if (now < lockEnd) {
        const penalty = Math.round(bahasha.balance * 0.02);
        await supabase.from('bahashas').update({ is_locked: false, lock_until: null, balance: bahasha.balance - penalty }).eq('id', bahasha.id);
        await supabase.from('transactions').insert({ user_id: req.userId, bahasha_id: bahasha.id, type: 'penalty', amount: -penalty, fee: penalty, description: `Early unlock penalty (2%) on ${bahasha.name}`, reference: `PEN-${Date.now()}` });
        return res.json({ message: `Bahasha unlocked. Penalty: TZS ${penalty.toLocaleString()}`, penalty, newBalance: bahasha.balance - penalty });
      }
      await supabase.from('bahashas').update({ is_locked: false, lock_until: null }).eq('id', bahasha.id);
      return res.json({ message: 'Bahasha unlocked (lock period expired)' });
    }

    // Lock
    if (lockUntil) {
      if (new Date(lockUntil) <= new Date()) return res.status(400).json({ error: 'Lock date must be in the future' });
      await supabase.from('bahashas').update({ is_locked: true, lock_until: lockUntil }).eq('id', bahasha.id);
      return res.json({ message: `Bahasha locked until ${lockUntil}` });
    }

    // Update name/percentage
    const updates = {};
    if (name) updates.name = name;
    if (goalName !== undefined) updates.goal_name = goalName || null;
    if (goalAmount !== undefined) updates.goal_amount = goalAmount || null;
    if (percentage !== undefined) {
      const { data: others } = await supabase.from('bahashas').select('percentage').eq('user_id', req.userId).neq('id', bahasha.id);
      const othersTotal = others.reduce((s, b) => s + b.percentage, 0);
      if (othersTotal + percentage > 100.01) return res.status(400).json({ error: `Total would be ${othersTotal + percentage}%` });
      updates.percentage = percentage;
    }

    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString();
      await supabase.from('bahashas').update(updates).eq('id', bahasha.id);
    }

    const { data: updated } = await supabase.from('bahashas').select('*').eq('id', bahasha.id).single();
    res.json({ id: updated.id, name: updated.name, percentage: updated.percentage, balance: updated.balance, color: updated.color, isLocked: updated.is_locked, lockUntil: updated.lock_until, goalName: updated.goal_name, goalAmount: updated.goal_amount });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/batch/rebalance', async (req, res) => {
  try {
    const { allocations } = req.body;
    if (!Array.isArray(allocations) || allocations.length < 2) return res.status(400).json({ error: 'At least 2 allocations required' });
    const total = allocations.reduce((s, a) => s + a.percentage, 0);
    if (Math.abs(total - 100) > 0.01) return res.status(400).json({ error: `Percentages must sum to 100%. Current: ${total}%` });

    for (const { id, percentage } of allocations) {
      await supabase.from('bahashas').update({ percentage, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', req.userId);
    }

    const { data: bahashas } = await supabase.from('bahashas').select('id, name, percentage, balance').eq('user_id', req.userId).order('created_at');
    res.json({ message: 'Allocations updated', bahashas });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { transferToId } = req.body;
    const { data: bahasha } = await supabase.from('bahashas').select('*').eq('id', req.params.id).eq('user_id', req.userId).single();
    if (!bahasha) return res.status(404).json({ error: 'Bahasha not found' });

    const { data: all } = await supabase.from('bahashas').select('id').eq('user_id', req.userId);
    if (all.length <= 2) return res.status(400).json({ error: 'Minimum 2 bahashas required' });

    if (bahasha.balance > 0) {
      if (!transferToId) return res.status(400).json({ error: 'Must specify transferToId when bahasha has a balance' });
      const { data: target } = await supabase.from('bahashas').select('*').eq('id', transferToId).eq('user_id', req.userId).single();
      if (!target) return res.status(404).json({ error: 'Transfer target not found' });

      await supabase.from('bahashas').update({ balance: target.balance + bahasha.balance }).eq('id', transferToId);
      await supabase.from('transactions').insert({ user_id: req.userId, bahasha_id: transferToId, type: 'transfer', amount: bahasha.balance, description: `Balance transfer from deleted bahasha "${bahasha.name}"`, reference: `TRF-${Date.now()}` });
    }

    await supabase.from('bahashas').delete().eq('id', bahasha.id);
    res.json({ message: `Bahasha "${bahasha.name}" removed` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
