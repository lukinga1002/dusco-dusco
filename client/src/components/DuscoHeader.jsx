import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';

export default function DuscoHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
      <button onClick={() => navigate('/welcome')} className="text-xl font-black text-dusco" aria-label="Dusco home">dusco</button>
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/welcome')} aria-label="Home" className="p-1 text-dark hover:text-dusco transition">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4m-4 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-6 0h6" />
          </svg>
        </button>
        <NotificationBell />
        <div className="w-8 h-8 rounded-full bg-dusco-light text-dusco font-bold text-sm flex items-center justify-center">
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </div>
  );
}
