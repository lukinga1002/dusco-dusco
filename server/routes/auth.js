const express = require('express');
const bcrypt = require('bcryptjs');
const { supabase, getUniqueDuscoNumber } = require('../db/database');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { recordConsent, validateDecisions } = require('../services/consent');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { phone, name, password, consents } = req.body;
    if (!phone || !name || !password) return res.status(400).json({ error: 'Phone, name, and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    // Validate consent BEFORE creating the user, so we can never end up with an
    // account that exists without the consent record that justifies processing.
    // Consent is optional here only for backwards compatibility with the older
    // client; make it mandatory before the live pilot (see docs/PDPA_COMPLIANCE.md).
    if (consents !== undefined) {
      const check = validateDecisions(consents);
      if (!check.ok) return res.status(400).json({ error: check.error });
      const serviceConsent = check.decisions.find(d => d.purpose === 'service_operation');
      if (!serviceConsent || !serviceConsent.granted) {
        return res.status(400).json({
          error: 'Consent to operate your savings service is required to register.',
        });
      }
    }

    const { data: existing } = await supabase.from('users').select('id').eq('phone', phone).maybeSingle();
    if (existing) return res.status(409).json({ error: 'Phone number already registered' });

    const passwordHash = bcrypt.hashSync(password, 10);
    const duscoNumber = await getUniqueDuscoNumber();

    const { data, error } = await supabase.from('users')
      .insert({ phone, name, password_hash: passwordHash, dusco_number: duscoNumber })
      .select('id, dusco_number, phone').single();

    if (error) throw error;

    let consentRecorded = false;
    if (consents !== undefined) {
      try {
        await recordConsent(data.id, consents, { source: 'registration' });
        consentRecorded = true;
      } catch (consentErr) {
        // The account exists but its consent record failed to write. Roll the
        // account back rather than run a savings service with no lawful basis.
        await supabase.from('users').delete().eq('id', data.id);
        return res.status(500).json({
          error: 'Could not record your consent, so the account was not created. Please try again.',
        });
      }
    }

    res.status(201).json({
      message: 'Registration successful. Please verify your phone.',
      userId: data.id, duscoNumber: data.dusco_number, phone, consentRecorded,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });
    if (!/^\d{4}$/.test(otp)) return res.status(400).json({ error: 'OTP must be a 4-digit code' });

    const { data: user } = await supabase.from('users').select('id').eq('phone', phone).maybeSingle();
    if (!user) return res.status(404).json({ error: 'User not found' });

    await supabase.from('users').update({ is_verified: true }).eq('id', user.id);
    const token = generateToken(user.id);
    res.json({ message: 'Phone verified successfully', token, userId: user.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Phone and password are required' });

    const { data: user } = await supabase.from('users').select('*').eq('phone', phone).maybeSingle();
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }
    // A closed account keeps its row (the ledger is retained against it) but
    // must not be able to sign in again.
    if (user.deleted_at) {
      return res.status(403).json({ error: 'This account has been closed.' });
    }

    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, phone: user.phone, name: user.name, duscoNumber: user.dusco_number, isVerified: user.is_verified } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { data: user } = await supabase.from('users').select('id, phone, name, dusco_number, is_verified, created_at').eq('id', req.userId).single();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, phone: user.phone, name: user.name, duscoNumber: user.dusco_number, isVerified: user.is_verified, createdAt: user.created_at });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    await supabase.from('users').update({ name, updated_at: new Date().toISOString() }).eq('id', req.userId);
    res.json({ message: 'Profile updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
