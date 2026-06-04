import DuscoHeader from './DuscoHeader';
import BottomNav from './BottomNav';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      <DuscoHeader />
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
