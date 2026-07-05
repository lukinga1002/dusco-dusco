/**
 * GCA Pay webhook receiver.
 *
 * Mounted with a RAW body parser (see index.js) so we can verify the signature over the
 * exact bytes GCA Pay sent. Flow:
 *   1. verify HMAC signature (reject if invalid)
 *   2. idempotency: record event_id; ignore duplicates
 *   3. route by event type:
 *        - collection completed  → resolve Dusco number → split into bahashas
 *        - disbursement completed/failed → mark the matching withdrawal
 *   4. always 200 quickly so GCA Pay doesn't retry a success
 *
 * Field names below are tolerant of several shapes; lock them to GCA Pay's real payload
 * once you have the sandbox docs.
 */

const express = require('express');
const { supabase } = require('../db/database');
const { verifyWebhookSignature } = require('../services/gcapay');
const { applyIncomingCollection } = require('../services/deposits');

const router = express.Router();

const SIGNATURE_HEADERS = ['x-gcapay-signature', 'x-signature', 'signature'];

const pick = (obj, keys) => { for (const k of keys) { if (obj?.[k] != null) return obj[k]; } return undefined; };

function normalize(evt) {
  const data = evt.data || evt.payload || evt;
  return {
    eventId: pick(evt, ['event_id', 'id', 'eventId']) || pick(data, ['transaction_id', 'id', 'reference']),
    type: (pick(evt, ['type', 'event', 'event_type']) || '').toLowerCase(),
    status: (pick(data, ['status', 'state']) || '').toLowerCase(),
    reference: pick(data, ['reference', 'transaction_id', 'id']),
    amount: Number(pick(data, ['amount', 'value']) || 0),
    network: pick(data, ['network', 'channel', 'source_network', 'destination_network']),
    duscoNumber: pick(data, ['account_reference', 'account', 'dusco_number', 'reference_account']),
    senderPhone: pick(data, ['phone', 'source_phone', 'payer', 'msisdn']),
    raw: evt,
  };
}

const isCollection = (t, s) =>
  /collect|c2b|deposit|payment|charge/.test(t) || (/payment/.test(t) && /success|complete/.test(s));
const isDisbursement = (t) => /disburse|b2c|payout|withdraw/.test(t);
const isSuccess = (s) => /success|complete|paid|settled/.test(s);
const isFailure = (s) => /fail|declin|revers|cancel/.test(s);

// POST /api/webhooks/gcapay   (raw body — Buffer)
router.post('/gcapay', async (req, res) => {
  const raw = req.body; // Buffer, from express.raw
  const sigHeader = SIGNATURE_HEADERS.map(h => req.headers[h]).find(Boolean);

  const sig = verifyWebhookSignature(raw, sigHeader);
  if (!sig.ok) {
    console.warn('[gcapay webhook] rejected:', sig.reason);
    return res.status(401).json({ error: 'invalid signature' });
  }
  if (!sig.verified) console.warn('[gcapay webhook] no secret configured — accepting unverified (set GCAPAY_WEBHOOK_SECRET)');

  let evt;
  try { evt = JSON.parse(Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw)); }
  catch { return res.status(400).json({ error: 'invalid json' }); }

  const e = normalize(evt);
  if (!e.eventId) return res.status(400).json({ error: 'missing event id' });

  // Idempotency — unique event_id; duplicates are ack'd without reprocessing
  const { error: insErr } = await supabase.from('webhook_events')
    .insert({ event_id: String(e.eventId), type: e.type, reference: e.reference ? String(e.reference) : null, payload: evt });
  if (insErr) {
    if (insErr.code === '23505') return res.json({ received: true, duplicate: true });
    console.error('[gcapay webhook] store error:', insErr.message);
    // fall through and still try to process
  }

  try {
    if (isCollection(e.type, e.status) && isSuccess(e.status)) {
      if (!e.duscoNumber) throw new Error('collection without account_reference (Dusco number)');
      const { data: user } = await supabase.from('users').select('id').eq('dusco_number', e.duscoNumber).maybeSingle();
      if (!user) throw new Error(`unknown Dusco number ${e.duscoNumber}`);
      await applyIncomingCollection({
        userId: user.id, amount: e.amount, sourceNetwork: e.network || 'Unknown',
        senderPhone: e.senderPhone, reference: String(e.reference || e.eventId), external: true,
      });
      await supabase.from('webhook_events').update({ processed: true }).eq('event_id', String(e.eventId));
      return res.json({ received: true, applied: 'collection' });
    }

    if (isDisbursement(e.type)) {
      const status = isSuccess(e.status) ? 'completed' : isFailure(e.status) ? 'failed' : 'pending';
      if (e.reference) {
        await supabase.from('transactions').update({ status })
          .eq('reference', String(e.reference)).eq('type', 'withdrawal');
      }
      await supabase.from('webhook_events').update({ processed: true }).eq('event_id', String(e.eventId));
      return res.json({ received: true, applied: 'disbursement', status });
    }

    // Unhandled event type — acknowledged so GCA Pay stops retrying
    return res.json({ received: true, ignored: e.type || 'unknown' });
  } catch (err) {
    console.error('[gcapay webhook] processing error:', err.message);
    // 200 so the provider doesn't hammer retries on an app-side data issue; we have the
    // event stored (processed=false) for manual replay/reconciliation.
    return res.json({ received: true, deferred: true, reason: err.message });
  }
});

// Simple health for the webhook path (useful when giving GCA Pay the URL)
router.get('/gcapay', (req, res) => res.json({ ok: true, endpoint: 'gcapay-webhook' }));

module.exports = router;
