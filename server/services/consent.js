/**
 * Consent recording (Personal Data Protection Act, Cap. 44, 2023).
 *
 * Financial-transaction data is high-risk personal data, so consent has to be
 * demonstrable, not assumed. The `consents` table is an APPEND-ONLY audit log:
 * every grant and every withdrawal inserts a new row. Nothing is updated or
 * deleted, so the history of what a person agreed to — and exactly when — is
 * always reconstructable.
 *
 * Current state for a purpose = the most recent row for that (user_id, purpose).
 *
 * Data minimisation: we deliberately do NOT store IP address or user agent.
 * The record holds only what is needed to prove a decision was made: who, what
 * purpose, granted or withdrawn, which policy version, where it was captured,
 * and when.
 */

const { supabase } = require('../db/database');

// The version of the privacy notice currently in force. Bump this when the
// notice materially changes — consent is only meaningful against a version.
const POLICY_VERSION = '2026-09';

/**
 * The purposes a user can consent to.
 * - required: the service cannot run without it, so withdrawal means closing
 *   the account rather than silently continuing to process.
 */
const PURPOSES = {
  service_operation: {
    required: true,
    label: 'Operating your savings service',
    description:
      'Processing your transaction and balance data to open bahashas, split deposits, run group ledgers and keep your records accurate.',
  },
  marketing: {
    required: false,
    label: 'Product and marketing messages',
    description:
      'Occasional messages about new Dusco features and offers. Optional, and you can withdraw this at any time.',
  },
};

const VALID_SOURCES = ['registration', 'settings', 'admin'];

function isValidPurpose(purpose) {
  return Object.prototype.hasOwnProperty.call(PURPOSES, purpose);
}

/**
 * Validate a batch of consent decisions before anything is written.
 * Returns { ok: true, decisions } or { ok: false, error }.
 */
function validateDecisions(decisions) {
  if (!Array.isArray(decisions) || decisions.length === 0) {
    return { ok: false, error: 'At least one consent decision is required' };
  }
  const seen = new Set();
  const cleaned = [];
  for (const entry of decisions) {
    if (!entry || typeof entry !== 'object') {
      return { ok: false, error: 'Each consent decision must be an object' };
    }
    const { purpose, granted } = entry;
    if (!isValidPurpose(purpose)) {
      return { ok: false, error: `Unknown consent purpose: ${purpose}` };
    }
    if (typeof granted !== 'boolean') {
      return { ok: false, error: `Consent for "${purpose}" must be true or false` };
    }
    if (seen.has(purpose)) {
      return { ok: false, error: `Duplicate consent decision for "${purpose}"` };
    }
    seen.add(purpose);
    cleaned.push({ purpose, granted });
  }
  return { ok: true, decisions: cleaned };
}

/**
 * Append consent decisions for a user. Never updates existing rows.
 * Returns the rows written.
 */
async function recordConsent(userId, decisions, { source = 'settings', policyVersion = POLICY_VERSION } = {}) {
  const check = validateDecisions(decisions);
  if (!check.ok) throw Object.assign(new Error(check.error), { statusCode: 400 });

  const safeSource = VALID_SOURCES.includes(source) ? source : 'settings';
  const rows = check.decisions.map(d => ({
    user_id: userId,
    purpose: d.purpose,
    granted: d.granted,
    policy_version: policyVersion,
    source: safeSource,
  }));

  const { data, error } = await supabase.from('consents').insert(rows).select();
  if (error) throw error;
  return data;
}

/**
 * The user's current consent state: the latest decision per purpose, plus the
 * purposes they have never answered.
 */
async function getCurrentConsent(userId) {
  const { data, error } = await supabase
    .from('consents')
    .select('purpose, granted, policy_version, source, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const latest = {};
  for (const row of data || []) {
    // Rows arrive newest-first, so the first one seen per purpose is current.
    if (!latest[row.purpose]) latest[row.purpose] = row;
  }

  const purposes = Object.entries(PURPOSES).map(([purpose, meta]) => {
    const record = latest[purpose];
    return {
      purpose,
      label: meta.label,
      description: meta.description,
      required: meta.required,
      granted: record ? record.granted : null, // null = never answered
      policyVersion: record ? record.policy_version : null,
      recordedAt: record ? record.created_at : null,
      source: record ? record.source : null,
      // True when the decision predates the current notice and should be re-asked.
      needsReconfirmation: !!record && record.policy_version !== POLICY_VERSION,
    };
  });

  return {
    policyVersion: POLICY_VERSION,
    purposes,
    // The service cannot lawfully run on consent that was never given.
    outstanding: purposes.filter(p => p.granted === null || p.needsReconfirmation).map(p => p.purpose),
  };
}

/** Full append-only history, newest first — the audit trail. */
async function getConsentHistory(userId, limit = 100) {
  const { data, error } = await supabase
    .from('consents')
    .select('id, purpose, granted, policy_version, source, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id,
    purpose: r.purpose,
    granted: r.granted,
    policyVersion: r.policy_version,
    source: r.source,
    recordedAt: r.created_at,
  }));
}

module.exports = {
  POLICY_VERSION,
  PURPOSES,
  isValidPurpose,
  validateDecisions,
  recordConsent,
  getCurrentConsent,
  getConsentHistory,
};
