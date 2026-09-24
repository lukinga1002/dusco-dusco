const jwt = require('jsonwebtoken');
const { supabase } = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'dusco-demo-secret-2026';
const JWT_EXPIRES = '7d';

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  // A token stays valid for 7 days, so the signature alone is not enough: an
  // account closed a minute ago would otherwise keep working until the token
  // expired. Check the account is still open on every request.
  try {
    const { data: user, error } = await supabase
      .from('users').select('deleted_at').eq('id', decoded.userId).maybeSingle();
    if (error) throw error;
    if (!user) return res.status(403).json({ error: 'Account not found' });
    if (user.deleted_at) return res.status(403).json({ error: 'This account has been closed' });
  } catch (err) {
    return res.status(503).json({ error: 'Could not verify your session. Please try again.' });
  }

  req.userId = decoded.userId;
  next();
}

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.isAdmin = true;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { generateToken, authenticateToken, authenticateAdmin, JWT_SECRET };
