const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { supabase } = require('../db/database');
const {
  PIN_LENGTH, isValidPin, isWeakPin, randomSalt, hashPin, sameHash,
  ensureProfile, getProfile, summaryOf,
} = require('../services/kyc');

const router = express.Router();
router.use(authenticateToken);

// GET /api/security — tier, limits, usage and whether a PIN is set.
// Never returns the PIN hash or salt.
router.get('/', async (req, res) => {
  try {
    const profile = await ensureProfile(req.userId);
    res.json(summaryOf(profile));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/security/pin — set or change the transaction PIN.
// Changing an existing PIN requires the current one: a hijacked session must
// not be able to lock the real owner out of their own money.
router.post('/pin', async (req, res) => {
  try {
    const { pin, currentPin } = req.body || {};

    if (!isValidPin(pin)) {
      return res.status(400).json({ error: `Your PIN must be ${PIN_LENGTH} digits.`, code: 'pin_invalid' });
    }
    if (isWeakPin(pin)) {
      return res.status(400).json({
        error: 'Choose a less predictable PIN — not all the same digit, and not a run like 1234.',
        code: 'pin_weak',
      });
    }

    const profile = await ensureProfile(req.userId);

    if (profile.pin_hash) {
      if (!isValidPin(currentPin) || !sameHash(hashPin(currentPin, profile.pin_salt), profile.pin_hash)) {
        return res.status(401).json({ error: 'Your current PIN is not correct.', code: 'pin_invalid' });
      }
    }

    const salt = randomSalt();
    await supabase.from('kyc_profiles').update({
      pin_hash: hashPin(pin, salt),
      pin_salt: salt,
      pin_failed_attempts: 0,
      pin_locked_until: null,
      updated_at: new Date().toISOString(),
    }).eq('user_id', req.userId);

    const updated = await getProfile(req.userId);
    res.json({ message: profile.pin_hash ? 'PIN changed' : 'PIN created', ...summaryOf(updated) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/security/verify — submit identity details.
//
// Deliberately does NOT raise the tier. A person must never be able to grant
// themselves a higher withdrawal limit; the tier is set by review. Submitting
// records the details and leaves the decision to that process.
router.post('/verify', async (req, res) => {
  try {
    const { fullName, region, dateOfBirth } = req.body || {};
    if (!fullName || !region) {
      return res.status(400).json({ error: 'Full name and region are required.' });
    }
    await ensureProfile(req.userId);
    await supabase.from('kyc_profiles').update({
      full_name: String(fullName).slice(0, 120),
      region: String(region).slice(0, 60),
      date_of_birth: dateOfBirth || null,
      updated_at: new Date().toISOString(),
    }).eq('user_id', req.userId);

    const updated = await getProfile(req.userId);
    res.json({
      message: 'Your details were received. Verification is reviewed before your limits change.',
      ...summaryOf(updated),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
