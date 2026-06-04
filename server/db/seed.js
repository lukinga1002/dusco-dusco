const bcrypt = require('bcryptjs');
const { initDb, getDb } = require('./database');

function seed() {
  const db = initDb();

  db.exec('DELETE FROM notifications');
  db.exec('DELETE FROM transactions');
  db.exec('DELETE FROM bahashas');
  db.exec('DELETE FROM admin_settings');
  db.exec('DELETE FROM users');

  const passwordHash = bcrypt.hashSync('demo1234', 10);

  // ── Demo User 1 (main demo account) ──
  const user1 = db.prepare(`
    INSERT INTO users (phone, name, password_hash, dusco_number, is_verified)
    VALUES (?, ?, ?, ?, 1)
  `).run('0712345678', 'Amina Juma', passwordHash, 'DUS-AM1234');

  const u1 = user1.lastInsertRowid;

  // Bahashas for user 1
  const b1 = db.prepare(`INSERT INTO bahashas (user_id, name, percentage, balance) VALUES (?, ?, ?, ?)`);
  const akiba = b1.run(u1, 'Akiba', 40, 480000);    // Savings
  const safari = b1.run(u1, 'Safari', 20, 215000);   // Travel
  const karo = b1.run(u1, 'Karo', 30, 367500);       // School Fees
  const binafsi = b1.run(u1, 'Binafsi', 10, 98500);  // Personal

  const bIds = {
    akiba: akiba.lastInsertRowid,
    safari: safari.lastInsertRowid,
    karo: karo.lastInsertRowid,
    binafsi: binafsi.lastInsertRowid,
  };

  // ── Transactions for user 1 (spanning 3 months) ──
  const txn = db.prepare(`
    INSERT INTO transactions (user_id, bahasha_id, type, amount, fee, source_network, destination, description, held_since, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Month 1 - March 2026
  // Salary deposit
  txn.run(u1, bIds.akiba, 'deposit', 320000, 0, 'Selcom-Pesa', null, 'Salary deposit - Akiba (40%)', '2026-03-05', '2026-03-05 09:15:00');
  txn.run(u1, bIds.safari, 'deposit', 160000, 0, 'Selcom-Pesa', null, 'Salary deposit - Safari (20%)', '2026-03-05', '2026-03-05 09:15:00');
  txn.run(u1, bIds.karo, 'deposit', 240000, 0, 'Selcom-Pesa', null, 'Salary deposit - Karo (30%)', '2026-03-05', '2026-03-05 09:15:00');
  txn.run(u1, bIds.binafsi, 'deposit', 80000, 0, 'Selcom-Pesa', null, 'Salary deposit - Binafsi (10%)', '2026-03-05', '2026-03-05 09:15:00');

  // Small M-Pesa transfer
  txn.run(u1, bIds.akiba, 'deposit', 20000, 500, 'M-Pesa', null, 'Transfer from mama - Akiba (40%)', '2026-03-12', '2026-03-12 14:30:00');
  txn.run(u1, bIds.safari, 'deposit', 10000, 0, 'M-Pesa', null, 'Transfer from mama - Safari (20%)', '2026-03-12', '2026-03-12 14:30:00');
  txn.run(u1, bIds.karo, 'deposit', 15000, 0, 'M-Pesa', null, 'Transfer from mama - Karo (30%)', '2026-03-12', '2026-03-12 14:30:00');
  txn.run(u1, bIds.binafsi, 'deposit', 5000, 0, 'M-Pesa', null, 'Transfer from mama - Binafsi (10%)', '2026-03-12', '2026-03-12 14:30:00');
  txn.run(u1, null, 'fee', 500, 0, null, null, 'Cross-network fee (M-Pesa)', null, '2026-03-12 14:30:00');

  // Withdrawal
  txn.run(u1, bIds.binafsi, 'withdrawal', -25000, 500, null, '0712345678 (M-Pesa)', 'Personal expense withdrawal', '2026-03-05', '2026-03-18 11:00:00');
  txn.run(u1, null, 'fee', 500, 0, null, null, 'Withdrawal fee', null, '2026-03-18 11:00:00');

  // Month 2 - April 2026
  // Salary deposit
  txn.run(u1, bIds.akiba, 'deposit', 320000, 0, 'Selcom-Pesa', null, 'Salary deposit - Akiba (40%)', '2026-04-05', '2026-04-05 09:30:00');
  txn.run(u1, bIds.safari, 'deposit', 160000, 0, 'Selcom-Pesa', null, 'Salary deposit - Safari (20%)', '2026-04-05', '2026-04-05 09:30:00');
  txn.run(u1, bIds.karo, 'deposit', 240000, 0, 'Selcom-Pesa', null, 'Salary deposit - Karo (30%)', '2026-04-05', '2026-04-05 09:30:00');
  txn.run(u1, bIds.binafsi, 'deposit', 80000, 0, 'Selcom-Pesa', null, 'Salary deposit - Binafsi (10%)', '2026-04-05', '2026-04-05 09:30:00');

  // Tigo Pesa gift
  txn.run(u1, bIds.akiba, 'deposit', 40000, 1000, 'Tigo Pesa', null, 'Birthday gift - Akiba (40%)', '2026-04-15', '2026-04-15 16:45:00');
  txn.run(u1, bIds.safari, 'deposit', 20000, 0, 'Tigo Pesa', null, 'Birthday gift - Safari (20%)', '2026-04-15', '2026-04-15 16:45:00');
  txn.run(u1, bIds.karo, 'deposit', 30000, 0, 'Tigo Pesa', null, 'Birthday gift - Karo (30%)', '2026-04-15', '2026-04-15 16:45:00');
  txn.run(u1, bIds.binafsi, 'deposit', 10000, 0, 'Tigo Pesa', null, 'Birthday gift - Binafsi (10%)', '2026-04-15', '2026-04-15 16:45:00');
  txn.run(u1, null, 'fee', 1000, 0, null, null, 'Cross-network fee (Tigo Pesa)', null, '2026-04-15 16:45:00');

  // Month 3 - May 2026
  // Salary deposit
  txn.run(u1, bIds.akiba, 'deposit', 320000, 0, 'Selcom-Pesa', null, 'Salary deposit - Akiba (40%)', '2026-05-05', '2026-05-05 09:20:00');
  txn.run(u1, bIds.safari, 'deposit', 160000, 0, 'Selcom-Pesa', null, 'Salary deposit - Safari (20%)', '2026-05-05', '2026-05-05 09:20:00');
  txn.run(u1, bIds.karo, 'deposit', 240000, 0, 'Selcom-Pesa', null, 'Salary deposit - Karo (30%)', '2026-05-05', '2026-05-05 09:20:00');
  txn.run(u1, bIds.binafsi, 'deposit', 80000, 0, 'Selcom-Pesa', null, 'Salary deposit - Binafsi (10%)', '2026-05-05', '2026-05-05 09:20:00');

  // Withdrawal from Karo for school fees
  txn.run(u1, bIds.karo, 'withdrawal', -150000, 1500, null, '0756789012 (NMB)', 'Term 2 school fees payment', '2026-03-05', '2026-05-20 10:00:00');
  txn.run(u1, null, 'fee', 1500, 0, null, null, 'Withdrawal fee', null, '2026-05-20 10:00:00');

  // Dividend payment
  txn.run(u1, bIds.akiba, 'dividend', 18500, 0, null, null, 'Annual dividend - Q1 2026 (credited to Akiba)', null, '2026-05-31 00:00:00');

  // ── Demo User 2 ──
  const user2 = db.prepare(`
    INSERT INTO users (phone, name, password_hash, dusco_number, is_verified)
    VALUES (?, ?, ?, ?, 1)
  `).run('0723456789', 'Baraka Mwangi', passwordHash, 'DUS-BM5678');
  const u2 = user2.lastInsertRowid;

  const b2 = db.prepare(`INSERT INTO bahashas (user_id, name, percentage, balance) VALUES (?, ?, ?, ?)`);
  b2.run(u2, 'Biashara', 50, 750000);    // Business
  b2.run(u2, 'Dharura', 20, 180000);     // Emergency
  b2.run(u2, 'Ndoto', 30, 420000);       // Dreams

  // ── Demo User 3 ──
  const user3 = db.prepare(`
    INSERT INTO users (phone, name, password_hash, dusco_number, is_verified)
    VALUES (?, ?, ?, ?, 1)
  `).run('0734567890', 'Fatima Hassan', passwordHash, 'DUS-FH9012');
  const u3 = user3.lastInsertRowid;

  const b3 = db.prepare(`INSERT INTO bahashas (user_id, name, percentage, balance) VALUES (?, ?, ?, ?)`);
  b3.run(u3, 'Nyumba', 35, 1200000);     // House
  b3.run(u3, 'Elimu', 25, 560000);       // Education
  b3.run(u3, 'Afya', 15, 230000);        // Health
  b3.run(u3, 'Starehe', 10, 95000);      // Leisure
  b3.run(u3, 'Familia', 15, 310000);     // Family

  // ── Demo User 4 ──
  const user4 = db.prepare(`
    INSERT INTO users (phone, name, password_hash, dusco_number, is_verified)
    VALUES (?, ?, ?, ?, 1)
  `).run('0745678901', 'Daniel Kimaro', passwordHash, 'DUS-DK3456');
  const u4 = user4.lastInsertRowid;

  const b4 = db.prepare(`INSERT INTO bahashas (user_id, name, percentage, balance) VALUES (?, ?, ?, ?)`);
  b4.run(u4, 'Akiba Kuu', 60, 2100000); // Main savings
  b4.run(u4, 'Matumizi', 40, 340000);   // Spending

  // ── Notifications for user 1 ──
  const notif = db.prepare(`
    INSERT INTO notifications (user_id, message, type, is_read, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  notif.run(u1, 'TZS 800,000 deposited via Selcom-Pesa. Split: Akiba TZS 320,000 | Safari TZS 160,000 | Karo TZS 240,000 | Binafsi TZS 80,000', 'deposit', 1, '2026-05-05 09:20:00');
  notif.run(u1, 'TZS 150,000 withdrawn from Karo to 0756789012 (NMB). Fee: TZS 1,500', 'withdrawal', 1, '2026-05-20 10:00:00');
  notif.run(u1, 'Dividend credited! TZS 18,500 added to Akiba (Q1 2026 earnings)', 'dividend', 0, '2026-05-31 00:00:00');
  notif.run(u1, 'Your Akiba bahasha lock expires in 7 days (2026-06-10)', 'lock_expiring', 0, '2026-06-03 08:00:00');

  // ── Admin Settings ──
  const setting = db.prepare(`INSERT INTO admin_settings (key, value) VALUES (?, ?)`);
  setting.run('admin_password', bcrypt.hashSync('admin2026', 10));
  setting.run('annual_return_rate', '0.08');
  setting.run('user_profit_share', '0.30');
  setting.run('company_profit_share', '0.70');
  setting.run('cross_network_fee_rate', '0.01');
  setting.run('cross_network_fee_min', '500');
  setting.run('withdrawal_fee_rate', '0.01');
  setting.run('withdrawal_fee_floor', '500');
  setting.run('withdrawal_fee_ceiling', '5000');
  setting.run('early_unlock_penalty_rate', '0.02');
  setting.run('fee_waiver_days', '90');

  console.log('Database seeded successfully!');
  console.log(`  Users: 4`);
  console.log(`  Bahashas: ${db.prepare('SELECT COUNT(*) as c FROM bahashas').get().c}`);
  console.log(`  Transactions: ${db.prepare('SELECT COUNT(*) as c FROM transactions').get().c}`);
  console.log(`  Notifications: ${db.prepare('SELECT COUNT(*) as c FROM notifications').get().c}`);
}

seed();
