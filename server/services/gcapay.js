/**
 * GCA Pay Adapter (Stub)
 *
 * This module will contain the real GCA Pay API integration.
 * Each function maps to a specific GCA Pay endpoint.
 * Currently exports stubs that the payment.js module calls.
 *
 * GCA Pay API docs: https://gca-pay.com/docs (placeholder)
 *
 * Endpoints:
 * - POST /api/v1/collections     → collectFromMobile()
 * - POST /api/v1/disbursements   → disburseToMobile()
 * - POST /api/v1/bulk-payouts    → bulkDisbursement()
 * - GET  /api/v1/transactions/:id → getStatus()
 */

function generateRef(prefix = 'GCA') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

/**
 * POST /api/v1/collections
 * Collect money from a mobile money or bank account
 */
async function collectFromMobile({ amount, source_network, source_phone }) {
  // Will call: POST https://api.gca-pay.com/v1/collections
  // Body: { amount, network: source_network, phone: source_phone, reference: ref }
  return {
    success: true,
    transaction_id: generateRef('COL'),
    network_reference: generateRef(source_network.replace(/\s/g, '').substring(0, 4).toUpperCase()),
    status: 'completed',
    timestamp: new Date().toISOString(),
  };
}

/**
 * POST /api/v1/disbursements
 * Send money to a mobile money or bank account
 */
async function disburseToMobile({ amount, destination_network, destination_phone }) {
  // Will call: POST https://api.gca-pay.com/v1/disbursements
  // Body: { amount, network: destination_network, phone: destination_phone, reference: ref }
  return {
    success: true,
    transaction_id: generateRef('DIS'),
    network_reference: generateRef(destination_network.replace(/\s/g, '').substring(0, 4).toUpperCase()),
    status: 'completed',
    timestamp: new Date().toISOString(),
  };
}

/**
 * POST /api/v1/bulk-payouts
 * Distribute dividends to multiple users
 */
async function bulkDisbursement({ payouts }) {
  // Will call: POST https://api.gca-pay.com/v1/bulk-payouts
  // Body: { payouts: [{ amount, network, phone, reference }] }
  return {
    success: true,
    batch_id: generateRef('BATCH'),
    total_amount: payouts.reduce((s, p) => s + p.amount, 0),
    count: payouts.length,
    status: 'completed',
    timestamp: new Date().toISOString(),
  };
}

/**
 * GET /api/v1/transactions/:id
 * Check status of a transaction
 */
async function getStatus(transaction_id) {
  // Will call: GET https://api.gca-pay.com/v1/transactions/{transaction_id}
  return {
    transaction_id,
    status: 'completed',
    timestamp: new Date().toISOString(),
  };
}

module.exports = { collectFromMobile, disburseToMobile, bulkDisbursement, getStatus };
