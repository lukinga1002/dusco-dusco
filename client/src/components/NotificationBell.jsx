import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { timeAgo } from '../utils/format';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.getNotifications().then(d => { setNotifs(d.notifications); setUnread(d.unreadCount); }).catch(() => {});
  }, []);

  const handleMarkAllRead = async () => {
    await api.markAllRead();
    setNotifs(n => n.map(x => ({ ...x, isRead: true })));
    setUnread(0);
  };

  const typeIcon = { deposit: '💰', withdrawal: '💸', dividend: '🎉', lock_expiring: '🔒', system: '📢' };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-1">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-dusco text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-9 w-80 bg-white shadow-xl rounded-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <span className="font-heading font-semibold text-sm">Notifications</span>
            {unread > 0 && <button onClick={handleMarkAllRead} className="text-xs text-dusco">Mark all read</button>}
          </div>
          {notifs.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500">No notifications</p>
          ) : notifs.map(n => (
            <div key={n.id} className={`px-4 py-3 border-b border-gray-50 ${!n.isRead ? 'bg-dusco-light/30' : ''}`}>
              <div className="flex gap-2">
                <span className="text-lg">{typeIcon[n.type] || '📢'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-dark-soft leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
