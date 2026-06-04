/**
 * Payment Service Interface
 *
 * Clean abstraction over the payment provider (GCA Pay).
 * All functions return mock responses with simulated 1-2s delays.
 * Replace mock internals with real gcapay.js calls when integrating.
 */

const gcapay = require('./gcapay');
const { SETTLEMENT_NETWORK } = require('./payment.types');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Collect a payment from an external source into a Dusco number.
 * Triggers deposit + auto-split into bahashas.
 *
 * Maps to: GCA Pay POST /api/v1/collections
 */
async function collectPayment({ amount, source_network, source_phone, dusco_number }) {
  await delay(800 + Math.random() * 700); // Simulate 0.8-1.5s network delay

  const isSameNetwork = source_network === SETTLEMENT_NETWORK;
  const crossNetworkFee = isSameNetwork ? 0 : Math.max(500, Math.round(amount * 0.01));
  const netAmount = amount - crossNetworkFee;

  const result = await gcapay.collectFromMobile({ amount, source_network, source_phone });

  return {
    success: true,
    transaction_id: result.transaction_id,
    network_reference: result.network_reference,
    gross_amount: amount,
    cross_network_fee: crossNetworkFee,
    net_amount: netAmount,
    is_same_network: isSameNetwork,
    source_network,
    dusco_number,
    timestamp: result.timestamp,
  };
}

/**
 * Disburse funds from a bahasha to an external phone/bank.
 *
 * Maps to: GCA Pay POST /api/v1/disbursements
 */
async function disburseFunds({ amount, destination_network, destination_phone, bahasha_id }) {
  await delay(800 + Math.random() * 700);

  const result = await gcapay.disburseToMobile({ amount, destination_network, destination_phone });

  return {
    success: true,
    transaction_id: result.transaction_id,
    network_reference: result.network_reference,
    amount,
    destination_network,
    destination_phone,
    bahasha_id,
    timestamp: result.timestamp,
  };
}

/**
 * Distribute dividends to multiple users in bulk.
 *
 * Maps to: GCA Pay POST /api/v1/bulk-payouts
 */
async function bulkPayout({ payouts }) {
  await delay(1500 + Math.random() * 1000);

  const result = await gcapay.bulkDisbursement({ payouts });

  return {
    success: true,
    batch_id: result.batch_id,
    total_amount: result.total_amount,
    payout_count: result.count,
    timestamp: result.timestamp,
  };
}

/**
 * Check the status of a previous transaction.
 *
 * Maps to: GCA Pay GET /api/v1/transactions/:id
 */
async function getTransactionStatus(transaction_id) {
  await delay(300);

  const result = await gcapay.getStatus(transaction_id);

  return {
    transaction_id: result.transaction_id,
    status: result.status,
    timestamp: result.timestamp,
  };
}

module.exports = { collectPayment, disburseFunds, bulkPayout, getTransactionStatus };
