import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { formatDate } from '../utils/format';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.updateProfile({ name: name.trim() });
      setUser(prev => ({ ...prev, name: name.trim() }));
      setEditing(false);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Profile header */}
      <div className="hero-gradient px-6 pt-6 pb-10 text-white text-center">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto text-2xl font-black">
          {user?.name?.charAt(0) || 'U'}
        </div>
        {editing ? (
          <div className="mt-3 flex items-center gap-2 max-w-xs mx-auto">
            <input value={name} onChange={e => setName(e.target.value)} autoFocus
              className="flex-1 px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 text-sm text-center border border-white/30 focus:outline-none" />
            <button onClick={handleSave} disabled={saving} className="text-xs bg-white text-dusco font-bold px-3 py-2 rounded-lg">Save</button>
            <button onClick={() => { setEditing(false); setName(user?.name || ''); }} className="text-xs text-white/70">Cancel</button>
          </div>
        ) : (
          <>
            <h2 className="mt-3 text-lg font-black">{user?.name}</h2>
            <button onClick={() => setEditing(true)} className="text-xs text-white/60 hover:text-white">Edit name</button>
          </>
        )}
        <p className="text-xs text-white/50 mt-1">{user?.phone}</p>
        <div className="mt-2 inline-block bg-white/15 rounded-full px-3 py-1 text-xs font-mono tracking-wide">
          {user?.duscoNumber}
        </div>
      </div>

      {/* Menu items */}
      <div className="px-5 -mt-4 space-y-2">
        <Link to="/manage" className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <span className="text-lg">✉️</span>
          <div className="flex-1">
            <p className="font-bold text-sm text-dark">Manage Bahashas</p>
            <p className="text-[10px] text-gray-500">Edit names, percentages, lock settings</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </Link>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-lg">🔔</span>
            <div className="flex-1">
              <p className="font-bold text-sm text-dark">Notifications</p>
              <p className="text-[10px] text-gray-500">Deposit alerts, withdrawal updates</p>
            </div>
            <div className="w-10 h-5 bg-success rounded-full relative">
              <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-lg">ℹ️</span>
            <div className="flex-1">
              <p className="font-bold text-sm text-dark">About Dusco</p>
              <p className="text-[10px] text-gray-500">Version 1.0 — Built for Tanzania</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="px-5 mt-6">
        <h3 className="font-bold text-xs text-gray-500 mb-2 uppercase tracking-wider">Account</h3>
        <div className="bg-surface rounded-xl p-4 space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{user?.phone}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Dusco Number</span><span className="font-mono font-medium">{user?.duscoNumber}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Member since</span><span className="font-medium">{user?.createdAt ? formatDate(user.createdAt) : '—'}</span></div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-5 mt-6 pb-8">
        <button onClick={handleLogout}
          className="w-full py-3 bg-surface border border-gray-200 rounded-xl text-sm font-bold text-error hover:bg-red-50 transition">
          Log Out
        </button>
      </div>
    </div>
  );
}
