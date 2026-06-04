const express = require('express');
const { supabase } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { data: notifications } = await supabase.from('notifications').select('*').eq('user_id', req.userId).order('created_at', { ascending: false }).limit(50);
    const { count } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', req.userId).eq('is_read', false);
    res.json({
      unreadCount: count || 0,
      notifications: (notifications || []).map(n => ({ id: n.id, title: n.title, message: n.message, type: n.type, isRead: n.is_read, createdAt: n.created_at })),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/read', async (req, res) => {
  try {
    await supabase.from('notifications').update({ is_read: true }).eq('id', req.params.id).eq('user_id', req.userId);
    res.json({ message: 'Notification marked as read' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/batch/read-all', async (req, res) => {
  try {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', req.userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
