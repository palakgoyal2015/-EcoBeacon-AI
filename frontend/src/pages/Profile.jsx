import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatEmission, getScoreColor, getScoreLabel } from '../utils/helpers';
import Navbar from '../components/Navbar';
import BadgesPanel from '../components/BadgesPanel';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [actRes, sumRes] = await Promise.all([
        api.get(`/activity/user/${user._id}?limit=15&page=${page}`),
        api.get(`/emissions/summary/${user._id}`)
      ]);
      setActivities(actRes.data.activities || []);
      setPagination(actRes.data.pagination || {});
      setSummary(sumRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await api.put('/auth/profile', { name: newName.trim() });
      await refreshUser();
      setEditName(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/activity/${id}`);
      await Promise.all([fetchData(), refreshUser()]);
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    }
  };

  const typeIcons = { transportation: '🚗', electricity: '⚡', food: '🍽️', shopping: '🛍️' };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pt-24 pb-12">

        {/* Profile Header */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold border-2 flex-shrink-0"
              style={{
                borderColor: getScoreColor(user?.ecoScore || 50),
                background: `${getScoreColor(user?.ecoScore || 50)}15`,
                color: getScoreColor(user?.ecoScore || 50)
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              {editName ? (
                <div className="flex items-center gap-3">
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="input-field max-w-xs py-2"
                    autoFocus
                  />
                  <button onClick={handleSaveName} disabled={saving} className="btn-primary py-2 px-4 text-sm">
                    {saving ? '...' : 'Save'}
                  </button>
                  <button onClick={() => { setEditName(false); setNewName(user?.name); }} className="btn-secondary py-2 px-4 text-sm">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                  <button onClick={() => setEditName(true)} className="text-slate-500 hover:text-slate-300 text-sm">✏️</button>
                </div>
              )}
              <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="badge" style={{ background: `${getScoreColor(user?.ecoScore || 50)}15`, color: getScoreColor(user?.ecoScore || 50), border: `1px solid ${getScoreColor(user?.ecoScore || 50)}40` }}>
                  {getScoreLabel(user?.ecoScore || 50)} — Score: {user?.ecoScore}
                </span>
                {user?.streak > 0 && (
                  <span className="badge bg-orange-500/15 text-orange-400 border border-orange-700/30">
                    🔥 {user.streak}-day streak
                  </span>
                )}
              </div>
            </div>

            {/* Stats mini grid */}
            <div className="grid grid-cols-2 gap-3 min-w-fit">
              {[
                { label: 'Total CO₂', value: `${formatEmission(summary?.summary?.total)} kg` },
                { label: 'This Month', value: `${formatEmission(summary?.summary?.monthly)} kg` },
                { label: 'Activities', value: summary?.activityCount?.total ?? '—' },
                { label: 'Badges', value: user?.badges?.length ?? 0 }
              ].map(s => (
                <div key={s.label} className="bg-slate-800/70 rounded-xl p-3 text-center min-w-[90px]">
                  <p className="text-white font-bold">{s.value}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Badges */}
          <BadgesPanel badges={user?.badges || []} streak={user?.streak || 0} />

          {/* Activity History */}
          <div className="lg:col-span-2 card-hover">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Activity History</h3>
              <span className="text-slate-500 text-xs">{pagination.total || 0} total</span>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-14 bg-slate-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                <span className="text-4xl opacity-40">📋</span>
                <p className="text-sm">No activities logged yet</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {activities.map(a => (
                    <div key={a._id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors group">
                      <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center text-base flex-shrink-0">
                        {typeIcons[a.type] || '📊'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 text-sm font-medium capitalize truncate">
                          {a.category.replace(/-/g, ' ')}
                          <span className="text-slate-500 font-normal text-xs ml-1">· {a.value} {a.unit || a.type === 'food' ? 'meals' : a.type === 'shopping' ? 'items' : a.type === 'electricity' ? 'kWh' : 'km'}</span>
                        </p>
                        <p className="text-slate-500 text-xs">{new Date(a.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold ${a.emission === 0 ? 'text-eco-400' : a.emission < 2 ? 'text-eco-300' : a.emission < 5 ? 'text-amber-400' : 'text-red-400'}`}>
                          {a.emission === 0 ? '0.00' : `+${a.emission.toFixed(2)}`}
                        </p>
                        <p className="text-slate-500 text-xs">kg CO₂</p>
                      </div>
                      <button
                        onClick={() => setDeleteTarget(a._id)}
                        className="opacity-0 group-hover:opacity-100 ml-2 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">← Prev</button>
                    <span className="flex items-center px-3 text-slate-400 text-sm">{page} / {pagination.pages}</span>
                    <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-3 text-sm disabled:opacity-40">Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="card max-w-sm w-full">
              <h3 className="font-bold text-white text-lg mb-2">Delete Activity?</h3>
              <p className="text-slate-400 text-sm mb-5">This will permanently remove the activity and recalculate your eco score.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={() => handleDelete(deleteTarget)} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
