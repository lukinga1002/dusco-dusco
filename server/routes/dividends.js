const express = require('express');
const { supabase } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');
const { calculateDividendProjection } = require('../services/dividend');

const router = express.Router();
router.use(authenticateToken);

router.get('/projection', async (req, res) => {
  try {
    const projection = await calculateDividendProjection(req.userId);
    res.json(projection);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/history', async (req, res) => {
  try {
    const { data: dividends } = await supabase.from('dividends')
      .select('*, bahashas(name)').eq('user_id', req.userId).order('created_at', { ascending: false });

    res.json({
      totalEarned: (dividends || []).reduce((s, d) => s + d.amount, 0),
      dividends: (dividends || []).map(d => ({
        id: d.id, amount: d.amount, bahashaName: d.bahashas?.name, yieldRate: d.yield_rate,
        periodStart: d.period_start, periodEnd: d.period_end, creditedAt: d.created_at,
      })),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
