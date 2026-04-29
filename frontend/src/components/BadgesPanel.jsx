import React from 'react';

const BADGE_DATA = {
  'Getting Started':    { icon: '✨', color: 'from-slate-600 to-slate-700',   glow: '#94a3b8' },
  'Active Tracker':     { icon: '📊', color: 'from-blue-800 to-blue-900',     glow: '#3b82f6' },
  'Dedicated Tracker':  { icon: '🏅', color: 'from-amber-700 to-amber-900',   glow: '#f59e0b' },
  'Eco Aware':          { icon: '🌿', color: 'from-eco-700 to-eco-900',       glow: '#22c55e' },
  'Eco Warrior':        { icon: '🌱', color: 'from-eco-600 to-eco-800',       glow: '#16a34a' },
  'Green Hero':         { icon: '🦸', color: 'from-emerald-500 to-emerald-800', glow: '#10b981' },
  '3-Day Streak':       { icon: '🔥', color: 'from-orange-700 to-orange-900',  glow: '#f97316' },
  'Week Warrior':       { icon: '⚡', color: 'from-yellow-600 to-yellow-900',  glow: '#eab308' },
  'Eco Champion':       { icon: '🏆', color: 'from-amber-500 to-amber-800',    glow: '#d97706' }
};

export default function BadgesPanel({ badges = [], streak = 0 }) {
  return (
    <div className="card-hover">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-white">Achievements</h3>
          <p className="text-slate-500 text-xs mt-0.5">Earn badges by staying consistent</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/15 border border-orange-700/30 rounded-xl">
            <span>🔥</span>
            <div>
              <p className="text-orange-400 font-bold text-sm leading-none">{streak}</p>
              <p className="text-orange-500 text-xs leading-none">day streak</p>
            </div>
          </div>
        )}
      </div>

      {badges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-slate-500 gap-2">
          <span className="text-4xl opacity-40">🏅</span>
          <p className="text-sm">Log activities to earn your first badge!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badgeName) => {
            const bd = BADGE_DATA[badgeName] || { icon: '⭐', color: 'from-slate-700 to-slate-900', glow: '#64748b' };
            return (
              <div
                key={badgeName}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-b ${bd.color} border border-white/5 group cursor-default`}
                style={{ boxShadow: `0 0 12px ${bd.glow}20` }}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{bd.icon}</span>
                <p className="text-xs text-center text-slate-300 font-medium leading-tight">{badgeName}</p>
              </div>
            );
          })}

          {/* Locked badges hint */}
          {badges.length < 4 && (
            <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/30 border-dashed">
              <span className="text-2xl opacity-30">🔒</span>
              <p className="text-xs text-center text-slate-600 leading-tight">More to unlock</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
