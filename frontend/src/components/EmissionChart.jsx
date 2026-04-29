import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { getCategoryColor } from '../utils/helpers';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl">
      <p className="text-slate-300 text-xs font-medium mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-400 capitalize">{entry.name}:</span>
          <span className="text-white font-semibold">{entry.value} kg</span>
        </div>
      ))}
      <div className="border-t border-slate-700 mt-2 pt-2 flex items-center gap-2 text-xs">
        <span className="text-slate-400">Total:</span>
        <span className="text-eco-400 font-bold">
          {payload.reduce((s, p) => s + (p.value || 0), 0).toFixed(2)} kg CO₂
        </span>
      </div>
    </div>
  );
};

export default function EmissionChart({ data = [], loading = false }) {
  const [view, setView] = useState('stacked');

  if (loading) {
    return (
      <div className="card-hover h-72 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-eco-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const categories = ['transportation', 'electricity', 'food', 'shopping'];
  const hasData = data.some(d => d.total > 0);

  return (
    <div className="card-hover">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-white">Emissions Over Time</h3>
          <p className="text-slate-500 text-xs mt-0.5">Daily CO₂ breakdown (kg)</p>
        </div>
        <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
          {[
            { value: 'stacked', label: 'Stacked' },
            { value: 'total', label: 'Total' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setView(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === opt.value ? 'bg-eco-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="h-56 flex flex-col items-center justify-center text-slate-500 gap-3">
          <span className="text-4xl opacity-50">📈</span>
          <p className="text-sm">No emission data yet. Start logging activities!</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              {categories.map(cat => (
                <linearGradient key={cat} id={`grad-${cat}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getCategoryColor(cat)} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={getCategoryColor(cat)} stopOpacity={0.02} />
                </linearGradient>
              ))}
              <linearGradient id="grad-total" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '12px' }}
              formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'capitalize' }}>{value}</span>}
            />

            {view === 'total' ? (
              <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2}
                    fill="url(#grad-total)" dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5 }} />
            ) : (
              categories.map(cat => (
                <Area key={cat} type="monotone" dataKey={cat} name={cat}
                      stroke={getCategoryColor(cat)} strokeWidth={1.5}
                      fill={`url(#grad-${cat})`} stackId="1" />
              ))
            )}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
