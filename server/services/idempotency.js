/**
 * Idempotency for money-moving requests.
 *
 * Mobile networks in Tanzania drop and retry requests routinely, and a user who
 * does not see a response will press Send again. Without this, each retry moves
 * money again. The UNIQUE (user_id, endpoint, key) constraint on
 * `idempotency_keys` is what actually enforces one-effect-per-key; the stored
 * response lets the retry receive the original answer instead of an error.
 *
 * Usage:
 *   router.post('/withdraw', withIdempotency('transactions.withdraw'), handler)
 *
 * The client supplies an `Idempotency-Key` header. It is currently optional so
 * that older clients keep working; once every client sends one, make it
 * required here and the guarantee becomes unconditional.
 */

const crypto = require('crypto');
const { supabase } = require('../db/database');

const UNIQUE_VIOLATION = '23505';

/** Stable hash of the request body, so the same key with a different body is caught. */
function hashBody(body) {
  const stable = JSON.stringify(body ?? {}, Object.keys(body ?? {}).sort());
  return crypto.createHash('sha256').update(stable).digest('hex');
}

function isValidKey(key) {
  return typeof key === 'string' && key.length >= 8 && key.length <= 200;
}

/**
 * Express middleware. When a key is present it either lets the request through
 * once, or short-circuits with the original response.
 */
function withIdempotency(endpoint) {
  return async function idempotencyMiddleware(req, res, next) {
    const key = req.get('Idempotency-Key');
    if (!key) return next(); // optional for now — see module comment

    if (!isValidKey(key)) {
      return res.status(400).json({ error: 'Idempotency-Key must be between 8 and 200 characters.' });
    }

    const requestHash = hashBody(req.body);

    // Claim the key. The unique constraint decides who wins a race.
    const { error: insertError } = await supabase.from('idempotency_keys').insert({
      key, user_id: req.userId, endpoint, request_hash: requestHash, status: 'in_progress',
    });

    if (insertError) {
      if (insertError.code !== UNIQUE_VIOLATION) {
        return res.status(503).json({ error: 'Could not process this request safely. Please try again.' });
      }

      const { data: existing } = await supabase
        .from('idempotency_keys')
        .select('*')
        .eq('user_id', req.userId).eq('endpoint', endpoint).eq('key', key)
        .maybeSingle();

      if (!existing) {
        return res.status(503).json({ error: 'Could not process this request safely. Please try again.' });
      }

      // Same key, different request. That is a client bug, not a retry — and
      // replaying the first response would be wrong for this one.
      if (existing.request_hash !== requestHash) {
        return res.status(422).json({
          error: 'This Idempotency-Key was already used for a different request.',
          code: 'idempotency_key_reused',
        });
      }

      if (existing.status === 'completed') {
        return res.status(existing.response_status || 200).json(existing.response_body);
      }

      if (existing.status === 'in_progress') {
        // The first attempt is still running. Returning 409 rather than a
        // duplicate keeps exactly one effect.
        return res.status(409).json({
          error: 'This request is still being processed. Please wait before trying again.',
          code: 'idempotency_in_progress',
        });
      }

      // A previous attempt failed outright, so this one may proceed.
      await supabase.from('idempotency_keys')
        .update({ status: 'in_progress', response_status: null, response_body: null })
        .eq('id', existing.id);
    }

    // Record whatever the handler finally answers, so a retry can replay it.
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      const status = res.statusCode || 200;
      const ok = status < 400;
      supabase.from('idempotency_keys').update({
        status: ok ? 'completed' : 'failed',
        response_status: status,
        response_body: ok ? body : null,
        completed_at: new Date().toISOString(),
      }).eq('user_id', req.userId).eq('endpoint', endpoint).eq('key', key)
        .then(() => {}, () => {}); // never let bookkeeping break the response
      return originalJson(body);
    };

    next();
  };
}

module.exports = { withIdempotency, hashBody };
