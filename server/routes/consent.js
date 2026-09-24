const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  POLICY_VERSION,
  PURPOSES,
  recordConsent,
  getCurrentConsent,
  getConsentHistory,
} = require('../services/consent');

const router = express.Router();

// GET /api/consent/purposes — public: what we ask consent for, and the current
// policy version. Used by the registration screen before a token exists.
router.get('/purposes', (req, res) => {
  res.json({
    policyVersion: POLICY_VERSION,
    purposes: Object.entries(PURPOSES).map(([purpose, meta]) => ({
      purpose,
      label: meta.label,
      description: meta.description,
      required: meta.required,
    })),
  });
});

router.use(authenticateToken);

// GET /api/consent — the signed-in user's current consent state.
router.get('/', async (req, res) => {
  try {
    res.json(await getCurrentConsent(req.userId));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/consent/history — the append-only audit trail.
router.get('/history', async (req, res) => {
  try {
    res.json({ history: await getConsentHistory(req.userId) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/consent — record decisions (grant or withdraw).
// Body: { decisions: [{ purpose, granted }], source? }
// Each call appends; nothing is overwritten.
router.post('/', async (req, res) => {
  try {
    const { decisions, source } = req.body;
    const written = await recordConsent(req.userId, decisions, { source: source || 'settings' });
    const current = await getCurrentConsent(req.userId);
    res.status(201).json({
      message: 'Consent recorded',
      recorded: written.length,
      ...current,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

module.exports = router;
