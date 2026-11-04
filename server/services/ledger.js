/**
 * Double-entry posting.
 *
 * Every movement of money is a balanced journal entry. Balances are no longer
 * written directly: `ledger_post` derives each saver balance from the journal
 * and updates the cached column itself, so the two cannot drift apart.
 *
 * The posting runs as a single Postgres function call on purpose. The Supabase
 * client talks to PostgREST, which cannot wrap several statements in one
 * transaction — so doing this in JavaScript would leave a window where the
 * journal and the balance disagree. Inside the function it is one transaction,
 * and the row lock it takes also removes the concurrent-withdrawal race.
 *
 * A side effect worth knowing: if the lines do not balance, the post is
 * refused. That makes the ledger a check on the rest of the code — a split
 * that rounds badly, or a fee that does not add up, fails loudly here instead
 * of quietly leaving money unaccounted for.
 */

const { supabase } = require('../db/database');

const ACCOUNTS = {
  providerClearing: 'provider_clearing',
  feeRevenue: 'fee_revenue',
  penaltyRevenue: 'penalty_revenue',
  dividendExpense: 'dividend_expense',
  openingBalance: 'opening_balance',
  userFunds: (bahashaId) => `user_funds:${bahashaId}`,
};

const INSUFFICIENT = /insufficient funds/i;

/**
 * Post a balanced entry. `lines` is [{ account, direction, amount }].
 * Zero-amount lines are dropped, since a journal line of nothing says nothing.
 */
async function post({ kind, reference, description, lines }) {
  const clean = (lines || [])
    .filter(l => Number(l.amount) > 0)
    .map(l => ({ account: l.account, direction: l.direction, amount: Math.round(Number(l.amount)) }));

  const { data, error } = await supabase.rpc('ledger_post', {
    p_kind: kind,
    p_reference: reference,
    p_description: description || null,
    p_lines: clean,
  });

  if (error) {
    const err = new Error(error.message);
    err.code = INSUFFICIENT.test(error.message) ? 'insufficient_funds' : 'ledger_error';
    err.statusCode = err.code === 'insufficient_funds' ? 400 : 500;
    throw err;
  }
  return data;
}

/** Money arriving: provider owes us, we owe the saver, we keep the fee. */
function depositLines({ gross, fee, splits }) {
  return [
    { account: ACCOUNTS.providerClearing, direction: 'debit', amount: gross },
    { account: ACCOUNTS.feeRevenue, direction: 'credit', amount: fee },
    ...splits.map(s => ({ account: ACCOUNTS.userFunds(s.bahashaId), direction: 'credit', amount: s.amount })),
  ];
}

/**
 * Money leaving. Fee-inclusive: `amount` leaves the bahasha, the recipient gets
 * `amount - fee`, and the fee is ours.
 */
function withdrawalLines({ bahashaId, amount, fee }) {
  return [
    { account: ACCOUNTS.userFunds(bahashaId), direction: 'debit', amount },
    { account: ACCOUNTS.providerClearing, direction: 'credit', amount: amount - fee },
    { account: ACCOUNTS.feeRevenue, direction: 'credit', amount: fee },
  ];
}

function penaltyLines({ bahashaId, penalty }) {
  return [
    { account: ACCOUNTS.userFunds(bahashaId), direction: 'debit', amount: penalty },
    { account: ACCOUNTS.penaltyRevenue, direction: 'credit', amount: penalty },
  ];
}

function transferLines({ fromBahashaId, toBahashaId, amount }) {
  return [
    { account: ACCOUNTS.userFunds(fromBahashaId), direction: 'debit', amount },
    { account: ACCOUNTS.userFunds(toBahashaId), direction: 'credit', amount },
  ];
}

function dividendLines({ bahashaId, amount }) {
  return [
    { account: ACCOUNTS.dividendExpense, direction: 'debit', amount },
    { account: ACCOUNTS.userFunds(bahashaId), direction: 'credit', amount },
  ];
}

/** Cached balances against the journal. Any non-zero difference is a break. */
async function reconcile() {
  const { data, error } = await supabase.from('ledger_reconciliation').select('*');
  if (error) throw error;
  const breaks = (data || []).filter(r => Number(r.difference) !== 0);
  const { data: totals } = await supabase.from('ledger_lines').select('direction, amount');
  const debits = (totals || []).filter(l => l.direction === 'debit').reduce((s, l) => s + Number(l.amount), 0);
  const credits = (totals || []).filter(l => l.direction === 'credit').reduce((s, l) => s + Number(l.amount), 0);
  return {
    balanced: debits === credits,
    totalDebits: debits,
    totalCredits: credits,
    accountsChecked: (data || []).length,
    breaks: breaks.map(b => ({
      bahashaId: b.bahasha_id, name: b.name,
      cachedBalance: Number(b.cached_balance),
      ledgerBalance: Number(b.ledger_balance),
      difference: Number(b.difference),
    })),
  };
}

module.exports = {
  ACCOUNTS, post, reconcile,
  depositLines, withdrawalLines, penaltyLines, transferLines, dividendLines,
};
