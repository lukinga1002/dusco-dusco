const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getDeletionPreview, deleteAccount } = require('../services/account');

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
