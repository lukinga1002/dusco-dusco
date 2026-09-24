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

/**
 * Export everything Dusco holds about this person (PDPA right of access and
 * data portability), as structured JSON.
 *
 * The hard constraint here is that an export must contain THIS person's data
 * and nobody else's. Group records are shared by their nature, so only the
 * person's own slice of a group is included — their role, their contributions,
 * their share ledger. Other members' names, phone numbers, balances and
 * contributions are deliberately left out: exercising one person's right of
 * access must not become a way to extract data about everyone they save with.
 *
 * Requires the password: this hands over a complete financial history in one
 * response, so a session someone walked away from should not be enough.
 */
async function exportAccountData(userId, password) {
  const { data: user } = await supabase
    .from('users')
    .select('id, name, phone, dusco_number, is_verified, created_at, password_hash, deleted_at')
    .eq('id', userId).maybeSingle();
  if (!user) throw Object.assign(new Error('Account not found'), { statusCode: 404 });
  if (user.deleted_at) throw Object.assign(new Error('This account has been closed'), { statusCode: 410 });

  if (!password || !bcrypt.compareSync(password, user.password_hash)) {
    throw Object.assign(new Error('Enter your current password to download your data'), { statusCode: 401 });
  }

  const [bahashas, transactions, dividends, notifications, consents, memberships] = await Promise.all([
    supabase.from('bahashas')
      .select('id, name, percentage, balance, color, is_locked, lock_until, goal_name, goal_amount, created_at')
      .eq('user_id', userId).order('created_at'),
    supabase.from('transactions')
      .select('id, bahasha_id, type, amount, fee, source_network, destination_phone, destination_network, reference, status, description, held_since, created_at')
      .eq('user_id', userId).order('created_at'),
    supabase.from('dividends')
      .select('id, bahasha_id, amount, yield_rate, period_start, period_end, created_at')
      .eq('user_id', userId).order('created_at'),
    supabase.from('notifications')
      .select('id, title, message, type, is_read, created_at')
      .eq('user_id', userId).order('created_at'),
    supabase.from('consents')
      .select('id, purpose, granted, policy_version, source, created_at')
      .eq('user_id', userId).order('created_at'),
    supabase.from('group_members')
      .select('group_id, role, status, joined_at, groups(name, dusco_number, contribution_frequency)')
      .eq('user_id', userId),
  ]);

  // Only this person's slice of each group.
  const groups = [];
  for (const m of memberships.data || []) {
    const [shares, groupTxns] = await Promise.all([
      supabase.from('group_shares')
        .select('id, amount, created_at').eq('group_id', m.group_id).eq('user_id', userId).order('created_at'),
      supabase.from('group_transactions')
        .select('id, type, amount, fee, description, reference, created_at')
        .eq('group_id', m.group_id).eq('user_id', userId).order('created_at'),
    ]);
    const shareRows = shares.data || [];
    groups.push({
      groupName: m.groups?.name || null,
      groupDuscoNumber: m.groups?.dusco_number || null,
      contributionFrequency: m.groups?.contribution_frequency || null,
      yourRole: m.role,
      membershipStatus: m.status,
      joinedAt: m.joined_at,
      yourSharesTotal: shareRows.reduce((sum, s) => sum + (s.amount || 0), 0),
      yourShareContributions: shareRows,
      yourGroupTransactions: groupTxns.data || [],
    });
  }

  return {
    export: {
      format: 'dusco-export-v1',
      generatedAt: new Date().toISOString(),
      about: 'Everything Dusco holds about you, provided under your right of access and data portability (Personal Data Protection Act, Cap. 44, 2023).',
    },
    profile: {
      name: user.name,
      phone: user.phone,
      duscoNumber: user.dusco_number,
      phoneVerified: user.is_verified,
      memberSince: user.created_at,
    },
    consentHistory: consents.data || [],
    bahashas: bahashas.data || [],
    transactions: transactions.data || [],
    dividends: dividends.data || [],
    notifications: notifications.data || [],
    groups,
    notIncluded: [
      'Your password, which is stored only as an irreversible hash and cannot be exported.',
      'Other members of your groups — their names, phone numbers, balances and contributions are their personal data, not yours.',
      'Group-level balances, which belong to the group rather than to any one member.',
      'Internal system logs and payment-provider records held for security and reconciliation.',
    ],
  };
}

module.exports = {
  LEDGER_RETENTION_YEARS,
  getDeletionBlockers,
  getDeletionPreview,
  deleteAccount,
  exportAccountData,
};
