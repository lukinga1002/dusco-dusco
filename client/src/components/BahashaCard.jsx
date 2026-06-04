import { formatTZS } from '../utils/format';

export default function BahashaCard({ bahasha, onClick }) {
  const colors = ['bg-dusco', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500'];
  const colorClass = colors[bahasha.id % colors.length];

  return (
    <button onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left w-full hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-semibold text-dark text-sm">{bahasha.name}</h3>
            {bahasha.isLocked && <span className="text-xs" title="Locked">🔒</span>}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{bahasha.percentage}% allocation</p>
        </div>
        <span className={`w-3 h-3 rounded-full ${colorClass}`}></span>
      </div>
      <p className="font-heading font-bold text-lg text-dark">{formatTZS(bahasha.balance)}</p>
      {/* Progress bar */}
      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass} transition-all duration-500`}
          style={{ width: `${bahasha.percentage}%` }} />
      </div>
    </button>
  );
}
