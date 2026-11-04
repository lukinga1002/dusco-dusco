/**
 * Identity tier, transaction PIN and withdrawal limits.
 *
 * These controls existed before, but only in a Base44 function that answered
 * the BROWSER with `{ authorized: true }`. The endpoint that actually moved the
 * money never consulted them, so calling it directly skipped the PIN, the tier
 * and the monthly cap entirely. This module exists so the money path itself
 * enforces them — a client-side "authorized" result is not a control.
 *
 * The PIN scheme is carried over unchanged because it was well built:
 * PBKDF2-SHA256, 120k iterations, a per-profile random salt, constant-time
 * comparison, lockout after repeated failures, and rejection of guessable PINs.
 */

const crypto = require('crypto');
const { supabase } = require('../db/database');

const PIN_LENGTH = 4;
const PIN_MAX_ATTEMPTS = 3;
const PIN_LOCK_MINUTES = 15;
const PBKDF2_ITERATIONS = 120000;
const GROUP_WITHDRAW_MIN_TIER = 2;

const TIERS = [
  { tier: 0, name: 'Unverified', perTxn: 0, monthly: 0, canWithdraw: false },
  { tier: 1, name: 'Basic', perTxn: 200000, monthly: 500000, canWithdraw: true },
  { tier: 2, name: 'Full', perTxn: 1500000, monthly: 5000000, canWithdraw: true },
];

function limitsFor(tier) {
  return TIERS.find(t => t.tier === Number(tier)) || TIERS[0];
}

function periodKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function isValidPin(pin) {
  return typeof pin === 'string' && new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
}

/** Reject PINs that are trivially guessable: one repeated digit, or a straight run. */
function isWeakPin(pin) {
  if (!isValidPin(pin)) return true;
  if (/^(\d)\1+$/.test(pin)) return true;
  const digits = pin.split('').map(Number);
  const ascending = digits.every((d, i) => i === 0 || d === digits[i - 1] + 1);
  const descending = digits.every((d, i) => i === 0 || d === digits[i - 1] - 1);
  return ascending || descending;
}

function randomSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function hashPin(pin, saltHex) {
  return crypto
    .pbkdf2Sync(String(pin), Buffer.from(saltHex, 'hex'), PBKDF2_ITERATIONS, 32, 'sha256')
    .toString('base64');
}

function sameHash(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function pinLockedUntil(profile) {
  if (!profile?.pin_locked_until) return null;
  const until = new Date(profile.pin_locked_until);
  if (Number.isNaN(until.getTime())) return null;
  return until.getTime() > Date.now() ? until : null;
}

async function getProfile(userId) {
  const { data } = await supabase.from('kyc_profiles').select('*').eq('user_id', userId).maybeSingle();
  return data || null;
}

/** Create the row on first use so later logic can assume it exists. */
async function ensureProfile(userId) {
  const existing = await getProfile(userId);
  if (existing) return existing;
  const { data } = await supabase.from('kyc_profiles').insert({ user_id: userId, tier: 0 }).select().single();
  return data;
}

function currentUsage(profile) {
  const key = periodKey();
  const withdrawn = profile?.period === key ? Number(profile.period_withdrawn_tzs) || 0 : 0;
  return { period: key, withdrawn };
}

/** The only shape the client ever sees — never the hash or the salt. */
function summaryOf(profile) {
  const tier = Number(profile?.tier) || 0;
  const limits = limitsFor(tier);
  const usage = currentUsage(profile);
  const locked = pinLockedUntil(profile);
  return {
    tier,
    tierName: limits.name,
    canWithdraw: limits.canWithdraw,
    pinSet: !!profile?.pin_hash,
    pinLockedUntil: locked ? locked.toISOString() : null,
    limits: { perTxn: limits.perTxn, monthly: limits.monthly },
    usage: { period: usage.period, withdrawn: usage.withdrawn, remaining: Math.max(0, limits.monthly - usage.withdrawn) },
    groupWithdrawMinTier: GROUP_WITHDRAW_MIN_TIER,
  };
}

/**
 * The single gate every withdrawal passes. Throws an error carrying
 * `statusCode` and `code` when the withdrawal must not proceed.
 *
 * Call this from inside the withdrawal route BEFORE any money moves. It also
 * consumes the monthly allowance atomically, so two concurrent withdrawals
 * cannot both fit under the cap.
 */
async function authorizeWithdrawal({ userId, amount, pin, channel = 'personal' }) {
  const fail = (code, message, statusCode = 403, extra = {}) =>
    Object.assign(new Error(message), { statusCode, code, ...extra });

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw fail('invalid_amount', 'Enter a positive whole amount.', 400);
  }

  const profile = await ensureProfile(userId);
  const tier = Number(profile.tier) || 0;
  const limits = limitsFor(tier);

  if (!limits.canWithdraw) {
    throw fail('tier_required', 'Verify your identity before sending money out of Dusco.', 403, { tier });
  }
  if (channel === 'group' && tier < GROUP_WITHDRAW_MIN_TIER) {
    throw fail('tier_required', 'Group withdrawals need Full verification.', 403, { tier });
  }
  if (!profile.pin_hash || !profile.pin_salt) {
    throw fail('pin_not_set', 'Create your transaction PIN before sending money out.', 403, { tier });
  }

  const locked = pinLockedUntil(profile);
  if (locked) {
    throw fail('pin_locked', 'Your PIN is locked. Try again later.', 423, { lockedUntil: locked.toISOString() });
  }

  const supplied = String(pin || '');
  if (!isValidPin(supplied) || !sameHash(hashPin(supplied, profile.pin_salt), profile.pin_hash)) {
    const attempts = (Number(profile.pin_failed_attempts) || 0) + 1;
    const lockNow = attempts >= PIN_MAX_ATTEMPTS;
    await supabase.from('kyc_profiles').update({
      pin_failed_attempts: lockNow ? 0 : attempts,
      pin_locked_until: lockNow ? new Date(Date.now() + PIN_LOCK_MINUTES * 60000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId);
    throw fail(
      lockNow ? 'pin_locked' : 'pin_invalid',
      lockNow ? `Too many wrong PINs. Try again in ${PIN_LOCK_MINUTES} minutes.` : 'That PIN is not correct.',
      401,
      { attemptsLeft: lockNow ? 0 : PIN_MAX_ATTEMPTS - attempts },
    );
  }

  if (amount > limits.perTxn) {
    throw fail('limit_txn', `A ${limits.name} account can send at most TZS ${limits.perTxn.toLocaleString('en-US')} in one transfer.`, 403, { limits });
  }

  const usage = currentUsage(profile);
  if (usage.withdrawn + amount > limits.monthly) {
    const left = Math.max(0, limits.monthly - usage.withdrawn);
    throw fail('limit_monthly', left > 0
      ? `That is over your monthly limit. You have TZS ${left.toLocaleString('en-US')} left this month.`
      : 'You have used your monthly withdrawal limit. It resets on the 1st.', 403, { limits, usage });
  }

  // Consume the allowance with a conditional update so two concurrent
  // withdrawals cannot both pass the check above and both proceed.
  const nextTotal = usage.withdrawn + amount;
  const { data: claimed } = await supabase
    .from('kyc_profiles')
    .update({
      period: usage.period,
      period_withdrawn_tzs: nextTotal,
      pin_failed_attempts: 0,
      pin_locked_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('period_withdrawn_tzs', profile.period === usage.period ? usage.withdrawn : profile.period_withdrawn_tzs)
    .select();

  if (!claimed || claimed.length === 0) {
    throw fail('retry', 'Another withdrawal was being processed. Please try again.', 409);
  }

  return { tier, limits, usage: { ...usage, withdrawn: nextTotal } };
}

/** Give back allowance when a withdrawal does not complete. */
async function releaseAllowance(userId, amount) {
  const profile = await getProfile(userId);
  if (!profile) return;
  const usage = currentUsage(profile);
  const restored = Math.max(0, usage.withdrawn - Number(amount || 0));
  await supabase.from('kyc_profiles')
    .update({ period_withdrawn_tzs: restored, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
}

module.exports = {
  TIERS, PIN_LENGTH, PIN_MAX_ATTEMPTS, PIN_LOCK_MINUTES, GROUP_WITHDRAW_MIN_TIER,
  limitsFor, periodKey, isValidPin, isWeakPin, randomSalt, hashPin, sameHash,
  getProfile, ensureProfile, summaryOf, authorizeWithdrawal, releaseAllowance,
};
