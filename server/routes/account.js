const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getDeletionPreview, deleteAccount, exportAccountData } = require('../services/account');

const router = express.Router();
router.use(authenticateToken);

// GET /api/account/deletion-preview
// What closing the account would erase, what it would keep and why, and
// anything currently blocking it. Shown before the person confirms.
router.get('/deletion-preview', async (req, res) => {
  try {
    res.json(await getDeletionPreview(req.userId));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/account/export — the person's own data as structured JSON
// (right of access / portability). POST rather than GET because it takes the
// password in the body, and so it is never cached or left in a URL.
router.post('/export', async (req, res) => {
  try {
    const { password } = req.body || {};
    const data = await exportAccountData(req.userId, password);
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Disposition', `attachment; filename="dusco-my-data-${stamp}.json"`);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// DELETE /api/account — irreversible. Requires the current password.
// Body: { password, confirm: "DELETE" }
router.delete('/', async (req, res) => {
  try {
    const { password, confirm } = req.body || {};
    // A typed confirmation as well as the password: this cannot be undone, and
    // a mis-click must not be able to trigger it.
    if (confirm !== 'DELETE') {
      return res.status(400).json({ error: 'Type DELETE to confirm closing your account' });
    }
    const result = await deleteAccount(req.userId, password);
    res.json({
      message: 'Your account is closed. Your personal details have been erased.',
      ...result,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message, blockers: err.blockers });
  }
});

module.exports = router;
