import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';

export default function DuscoHeader() {
  const { user } = useAuth();

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
      <span className="text-xl font-black text-dusco">dusco</span>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="w-8 h-8 rounded-full bg-dusco-light text-dusco font-bold text-sm flex items-center justify-center">
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </div>
  );
}
