/**
 * Payment operation schemas for GCA Pay integration
 *
 * These types define the interface between Dusco and the payment provider.
 * Currently mocked; will map to GCA Pay API endpoints when integrated.
 */

const SUPPORTED_NETWORKS = ['M-Pesa', 'Tigo Pesa', 'Airtel', 'Halotel', 'CRDB', 'NMB', 'Selcom'];

// Dusco settlement network (same-network deposits are free)
const SETTLEMENT_NETWORK = 'M-Pesa';

const TRANSACTION_STATUSES = ['pending', 'processing', 'completed', 'failed', 'reversed'];

module.exports = { SUPPORTED_NETWORKS, SETTLEMENT_NETWORK, TRANSACTION_STATUSES };
