/**
 * GCA Pay Adapter
 *
 * Makes REAL calls to GCA Pay when credentials are configured; otherwise falls back to
 * mock responses so the demo keeps working with no keys. Once you receive sandbox docs,
 * the only things to confirm/adjust are: the endpoint PATHS, the AUTH scheme, and the
 * webhook SIGNATURE scheme (all isolated below and env-driven).
 *
 * Env (set in Render / .env):
 *   GCAPAY_BASE_URL        e.g. https://sandbox.gca-pay.com/api/v1
 *   GCAPAY_API_KEY         API key / client id           (Bearer auth)
 *   GCAPAY_SECRET          shared secret for request HMAC (X-Signature)
 *   GCAPAY_WEBHOOK_SECRET  secret GCA Pay signs webhooks with
 *   GCAPAY_MOCK=true       force mock even if keys exist
 *   GCAPAY_PATH_COLLECT / _DISBURSE / _BULK / _STATUS   (override default paths)
 *
 * Endpoints (defaults — confirm at meeting):
 *   POST {COLLECT}   collections / C2B      → collectFromMobile()
 *   POST {DISBURSE}  disbursements / B2C    → disburseToMobile()
 *   POST {BULK}      bulk-payouts           → bulkDisbursement()
 *   GET  {STATUS}/:id transaction status    → getStatus()
 */

const crypto = require('crypto');

const BASE = process.env.GCAPAY_BASE_URL || '';
const API_KEY = process.env.GCAPAY_API_KEY || '';
const SECRET = process.env.GCAPAY_SECRET || '';
const WEBHOOK_SECRET = process.env.GCAPAY_WEBHOOK_SECRET || '';
const FORCE_MOCK = String(process.env.GCAPAY_MOCK || '').toLowerCase() === 'true';

const PATHS = {
  collect: process.env.GCAPAY_PATH_COLLECT || '/collections',
  disburse: process.env.GCAPAY_PATH_DISBURSE || '/disbursements',
  bulk: process.env.GCAPAY_PATH_BULK || '/bulk-payouts',
  status: process.env.GCAPAY_PATH_STATUS || '/transactions',
};

/** Live only when we have a base URL + key and aren't forcing mock. */
function isLive() {
  return !!BASE && !!API_KEY && !FORCE_MOCK;
}

function newRef(prefix = 'GCA') {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function sign(bodyString) {
  if (!SECRET) return undefined;
  return crypto.createHmac('sha256', SECRET).update(bodyString).digest('hex');
}

async function call(method, path, body) {
  const url = `${BASE}${path}`;
  const payload = body ? JSON.stringify(body) : undefined;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` };
  const signature = payload ? sign(payload) : undefined;
  if (signature) headers['X-Signature'] = signature; // confirm header name with GCA Pay

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, { method, headers, body: payload, signal: controller.signal });
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
    if (!res.ok) {
      const err = new Error(data?.message || `GCA Pay ${res.status} on ${path}`);
      err.status = res.status; err.body = data;
      throw err;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// ── Operations (each: live call OR mock) ──────────────────────────────────

async function collectFromMobile({ amount, source_network, source_phone, reference, dusco_number }) {
  const ref = reference || newRef('COL');
  if (isLive()) {
    // Map fields to GCA Pay's collection schema when you get the docs.
    const data = await call('POST', PATHS.collect, {
      amount, currency: 'TZS', network: source_network, phone: source_phone,
      account_reference: dusco_number, reference: ref,
    });
    return {
      success: true,
      transaction_id: data.transaction_id || data.id || ref,
      network_reference: data.network_reference || data.provider_ref || null,
      status: data.status || 'pending',
      timestamp: data.timestamp || new Date().toISOString(),
      raw: data,
    };
  }
  return mock('COL', source_network);
}

async function disburseToMobile({ amount, destination_network, destination_phone, reference }) {
  const ref = reference || newRef('DIS');
  if (isLive()) {
    const data = await call('POST', PATHS.disburse, {
      amount, currency: 'TZS', network: destination_network, phone: destination_phone, reference: ref,
    });
    return {
      success: true,
      transaction_id: data.transaction_id || data.id || ref,
      network_reference: data.network_reference || data.provider_ref || null,
      status: data.status || 'pending',
      timestamp: data.timestamp || new Date().toISOString(),
      raw: data,
    };
  }
  return mock('DIS', destination_network);
}

async function bulkDisbursement({ payouts, reference }) {
  const ref = reference || newRef('BATCH');
  if (isLive()) {
    const data = await call('POST', PATHS.bulk, { reference: ref, currency: 'TZS', payouts });
    return {
      success: true,
      batch_id: data.batch_id || data.id || ref,
      total_amount: payouts.reduce((s, p) => s + p.amount, 0),
      count: payouts.length,
      status: data.status || 'processing',
      timestamp: data.timestamp || new Date().toISOString(),
      raw: data,
    };
  }
  return {
    success: true, batch_id: ref, total_amount: payouts.reduce((s, p) => s + p.amount, 0),
    count: payouts.length, status: 'completed', timestamp: new Date().toISOString(),
  };
}

async function getStatus(transaction_id) {
  if (isLive()) {
    const data = await call('GET', `${PATHS.status}/${encodeURIComponent(transaction_id)}`);
    return { transaction_id, status: data.status || 'unknown', timestamp: data.timestamp || new Date().toISOString(), raw: data };
  }
  return { transaction_id, status: 'completed', timestamp: new Date().toISOString() };
}

function mock(prefix, network) {
  return {
    success: true,
    transaction_id: newRef(prefix),
    network_reference: newRef((network || 'NET').replace(/\s/g, '').slice(0, 4).toUpperCase()),
    status: 'completed',
    timestamp: new Date().toISOString(),
  };
}

// ── Webhook signature verification ────────────────────────────────────────

/**
 * Verify a GCA Pay webhook. Pass the RAW request body (Buffer/string) and the signature
 * header value. Uses HMAC-SHA256 with GCAPAY_WEBHOOK_SECRET — confirm the algorithm and
 * header name with GCA Pay and adjust here only.
 * Returns true if valid, or true when no secret is configured (demo mode — logged by caller).
 */
function verifyWebhookSignature(rawBody, signatureHeader) {
  if (!WEBHOOK_SECRET) return { ok: true, verified: false, reason: 'no-secret-configured' };
  if (!signatureHeader) return { ok: false, verified: false, reason: 'missing-signature' };
  const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody));
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
  const provided = String(signatureHeader).replace(/^sha256=/i, '').trim();
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  return { ok, verified: true, reason: ok ? 'valid' : 'mismatch' };
}

module.exports = {
  collectFromMobile, disburseToMobile, bulkDisbursement, getStatus,
  verifyWebhookSignature, isLive, newRef, WEBHOOK_SECRET,
};
