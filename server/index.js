require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallets');
const transactionRoutes = require('./routes/transactions');
const dividendRoutes = require('./routes/dividends');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const groupRoutes = require('./routes/groups');
const webhookRoutes = require('./routes/webhooks');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Webhooks need the RAW body for signature verification, so mount them with a raw
// parser BEFORE express.json() (which would otherwise consume the body).
app.use('/api/webhooks', express.raw({ type: '*/*', limit: '1mb' }), webhookRoutes);

// JSON body parsing for everything else
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dividends', dividendRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/groups', groupRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const { isLive } = require('./services/gcapay');
  res.json({
    status: 'ok', service: 'Dusco Dusco API', database: 'supabase-postgresql',
    gcapay: isLive() ? 'live' : 'mock', timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Dusco Dusco API running on http://localhost:${PORT}`);
  console.log(`Database: Supabase PostgreSQL`);
  const { isLive } = require('./services/gcapay');
  console.log(`GCA Pay: ${isLive() ? 'LIVE (keys configured)' : 'MOCK (no keys)'}`);
});
