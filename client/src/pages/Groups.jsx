import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { formatTZS } from '../utils/format';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGroups().then(d => setGroups(d.groups)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-dusco border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-dark">My Groups</h2>
          <p className="text-xs text-gray-400">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/groups/create" className="text-xs font-bold text-white bg-dusco px-3 py-1.5 rounded-lg hover:bg-dusco-dark transition">
          + Create
        </Link>
      </div>

      <div className="px-5 space-y-3 pb-6">
        {groups.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl">👥</span>
            <h3 className="font-bold text-dark mt-4">No groups yet</h3>
            <p className="text-sm text-gray-400 mt-1 mb-6">Create a savings group or get invited to one</p>
            <Link to="/groups/create" className="inline-block px-6 py-3 bg-dusco text-white font-bold rounded-xl hover:bg-dusco-dark transition">
              Create a Group
            </Link>
          </div>
        ) : groups.map(g => (
          <Link key={g.id} to={`/groups/${g.id}`}
            className="block bg-surface rounded-2xl p-4 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-dusco-light flex items-center justify-center text-lg">👥</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-dark text-sm">{g.name}</h3>
                <p className="text-[10px] text-gray-400">{g.memberCount} members · {g.contributionFrequency} · {g.duscoNumber}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-dark text-sm tabular-nums">{formatTZS(g.totalBalance)}</p>
                <p className="text-[10px] text-gray-400">total</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
