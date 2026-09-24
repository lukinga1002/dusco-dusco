/**
 * Account erasure (Personal Data Protection Act, Cap. 44, right to erasure).
 *
 * Two things pull in opposite directions here, and the design has to serve both:
 *
 *  1. The person may ask for their personal data to be erased.
 *  2. Dusco is a financial service. The transaction ledger underpins
 *     reconciliation, dispute resolution and anti-money-laundering
 *     record-keeping, so it cannot simply be destroyed on request — the right
 *     to erasure yields where another legal obligation requires retention.
 *
 * So erasure is implemented as ANONYMISATION, not DELETE:
 *   - identifying fields on the user row are scrubbed and login is disabled;
 *   - data with no retention justification (notifications) is deleted outright;
 *   - the financial ledger is retained, but is no longer linked to a person.
 *
 * A hard DELETE would cascade the ledger away, which is why it is not used.
 *
 * Money is never destroyed: deletion is refused while the person still holds a
 * balance or a claim on a group, because erasing the account would erase the
 * record of what they are owed.
 *
 * NOTE: the retention period below is a placeholder. Confirm the applicable
 * financial record-keeping period with Tanzanian counsel before the pilot.
 */

const bcrypt = require('bcryptjs');
const { supabase } = require('../db/database');

// Placeholder — confirm with counsel. Stated to the user so the promise is honest.
const LEDGER_RETENTION_YEARS = 7;

/**
 * Reasons the account cannot be erased yet. Returns an array; empty means the
 * account can be erased.
 */
async function getDeletionBlockers(userId) {
  const blockers = [];

  // 1. Money still in the user's own bahashas.
  const { data: bahashas } = await supabase
    .from('bahashas').select('name, balance, is_locked, lock_until').eq('user_id', userId);
  const balance = (bahashas || []).reduce((sum, b) => sum + (b.balance || 0), 0);
  if (balance > 0) {
    blockers.push({
      code: 'outstanding_balance',
      message: `You still have TZS ${Math.round(balance).toLocaleString()} saved. Withdraw it before closing your account.`,
      amount: Math.round(balance),
    });
  }

  // A locked bahasha cannot be emptied without the early-unlock penalty, so
  // call it out separately rather than leaving the person stuck.
  const locked = (bahashas || []).filter(b => b.is_locked && b.balance > 0);
  if (locked.length > 0) {
    blockers.push({
      code: 'locked_bahasha',
      message: `${locked.map(b => b.name).join(', ')} ${locked.length === 1 ? 'is' : 'are'} locked. Unlock first (an early-unlock penalty may apply), then withdraw.`,
    });
  }

  // 2. A claim on a group's shares ledger — money owed to them by the kikoba.
  const { data: shares } = await supabase
    .from('group_shares').select('amount').eq('user_id', userId);
  const shareTotal = (shares || []).reduce((sum, s) => sum + (s.amount || 0), 0);
  if (shareTotal > 0) {
    blockers.push({
      code: 'group_shares',
      message: `You hold TZS ${Math.round(shareTotal).toLocaleString()} in group shares. Settle with your group before closing your account.`,
      amount: Math.round(shareTotal),
    });
  }

  // 3. Sole admin of a group that still has other members — leaving would
  //    strand the group with nobody able to run it.
  const { data: adminOf } = await supabase
    .from('groups').select('id, name').eq('admin_user_id', userId);
  for (const group of adminOf || []) {
    const { count } = await supabase
      .from('group_members')
      .select('id', { count: 'exact', head: true })
      .eq('group_id', group.id).eq('status', 'active').neq('user_id', userId);
    if ((count || 0) > 0) {
      blockers.push({
        code: 'sole_group_admin',
        message: `You are the admin of "${group.name}". Hand the group over to another member before closing your account.`,
        groupId: group.id,
      });
    }
  }

  return blockers;
}

/** What a deletion would erase and what it would keep — shown before confirming. */
async function getDeletionPreview(userId) {
  const blockers = await getDeletionBlockers(userId);
  return {
    canDelete: blockers.length === 0,
    blockers,
    willErase: [
      'Your name and phone number',
      'Your Dusco number and sign-in credentials',
      'Your notifications',
    ],
    willRetain: [
      `Your transaction history, kept without your name attached for about ${LEDGER_RETENTION_YEARS} years to meet financial record-keeping obligations`,
      'Group ledger entries, which belong to the group\'s records as well as yours',
    ],
    retentionYears: LEDGER_RETENTION_YEARS,
    irreversible: true,
  };
}

/**
 * Erase the account. Requires the user's password: this is destructive and
 * irreversible, so a stolen or forgotten-open session must not be enough.
 */
async function deleteAccount(userId, password) {
  const { data: user } = await supabase
    .from('users').select('id, password_hash, deleted_at').eq('id', userId).maybeSingle();
  if (!user) throw Object.assign(new Error('Account not found'), { statusCode: 404 });
  if (user.deleted_at) throw Object.assign(new Error('This account has already been closed'), { statusCode: 410 });

  if (!password || !bcrypt.compareSync(password, user.password_hash)) {
    throw Object.assign(new Error('Enter your current password to confirm closing your account'), { statusCode: 401 });
  }

  const blockers = await getDeletionBlockers(userId);
  if (blockers.length > 0) {
    throw Object.assign(new Error(blockers[0].message), { statusCode: 409, blockers });
  }

  const now = new Date().toISOString();

  // Delete what has no retention justification.
  await supabase.from('notifications').delete().eq('user_id', userId);

  // Step out of any groups so the person no longer appears in another member's view.
  await supabase.from('group_members').delete().eq('user_id', userId);

  // Anonymise the identity. Phone and dusco_number are UNIQUE, so they are
  // replaced with per-account placeholders rather than nulled, and the original
  // values are not recoverable from what is left.
  const { error } = await supabase.from('users').update({
    name: 'Deleted user',
    phone: `deleted-${userId}`,
    dusco_number: `DEL-${userId}`,
    password_hash: 'account-closed',
    is_verified: false,
    deleted_at: now,
    updated_at: now,
  }).eq('id', userId);
  if (error) throw error;

  return {
    deletedAt: now,
    retentionYears: LEDGER_RETENTION_YEARS,
  };
}

module.exports = {
  LEDGER_RETENTION_YEARS,
  getDeletionBlockers,
  getDeletionPreview,
  deleteAccount,
};
