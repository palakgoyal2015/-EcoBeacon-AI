import React from 'react';

export default function StatsCard({ title, value, unit, icon, color, subtitle, trend }) {
  const colorMap = {
    green:  { bg: 'bg-eco-500/10',   border: 'border-eco-700/40',   text: 'text-eco-400',   icon: 'bg-eco-500/20' },
    blue:   { bg: 'bg-blue-500/10',  border: 'border-blue-700/40',  text: 'text-blue-400',  icon: 'bg-blue-500/20' },
    yellow: { bg: 'bg-amber-500/10', border: 'border-amber-700/40', text: 'text-amber-400', icon: 'bg-amber-500/20' },
    red:    { bg: 'bg-red-500/10',   border: 'border-red-700/40',   text: 'text-red-400',   icon: 'bg-red-500/20' },
    purple: { bg: 'bg-violet-500/10',border: 'border-violet-700/40',text: 'text-violet-400',icon: 'bg-violet-500/20' }
  };

  const c = colorMap[color] || colorMap.green;

  return (
    <div className={`card-hover ${c.bg} border ${c.border} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-white">{value}</span>
            {unit && <span className="text-slate-400 text-sm">{unit}</span>}
          </div>
          {subtitle && <p className={`text-xs mt-1.5 ${c.text}`}>{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend <= 0 ? 'text-eco-400' : 'text-red-400'}`}>
              <span>{trend <= 0 ? '↓' : '↑'}</span>
              <span>{Math.abs(trend).toFixed(1)} kg vs last week</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${c.icon} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
