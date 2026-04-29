import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const CONFIDENCE_COLOR = { high: 'text-eco-400', medium: 'text-amber-400', low: 'text-slate-500' };
const TREND_ICON = { increasing: '📈', decreasing: '📉', stable: '➡️' };

function GoalCard({ goal }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
      <span className="text-2xl">{goal.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-slate-200 text-sm font-medium">{goal.title}</p>
        <p className="text-slate-500 text-xs">Target: {goal.target} {goal.unit}</p>
      </div>
      {goal.saving > 0 && (
        <span className="text-eco-400 text-xs font-medium whitespace-nowrap">
          -{goal.saving} kg CO₂
        </span>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-eco-400 font-semibold">{payload[0].value} kg CO₂</p>
    </div>
  );
};

export default function ForecastPanel({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    api.get(`/ai/forecast/${userId}`)
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="card-hover">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🔮</span>
          <h3 className="font-semibold text-white">AI Emission Forecast</h3>
          <span className="ml-auto text-xs text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded-full">AI Feature</span>
        </div>
        <div className="h-32 flex items-center justify-center text-slate-500 text-sm">Analysing your data...</div>
      </div>
    );
  }

  if (!data?.forecast?.length) return null;

  const chartData = data.forecast.map(f => ({
    date: new Date(f.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    predicted: f.predicted,
    confidence: f.confidence,
    trend: f.trend,
  }));

  const firstDay = data.forecast[0];

  return (
    <div className="card-hover">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">🔮</span>
        <h3 className="font-semibold text-white">AI Emission Forecast</h3>
        <span className="ml-auto text-xs text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded-full">AI Feature</span>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm">{firstDay?.trend ? TREND_ICON[firstDay.trend] : '➡️'}</span>
        <p className="text-slate-400 text-xs">
          Trend: <span className="text-white capitalize">{firstDay?.trend || 'stable'}</span>
          {' · '}Confidence:
          <span className={`ml-1 font-medium ${CONFIDENCE_COLOR[firstDay?.confidence || 'low']}`}>
            {firstDay?.confidence || 'low'}
          </span>
        </p>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="predicted" stroke="#6366f1" fill="url(#forecastGrad)" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>

      {data.goals?.length > 0 && (
        <div className="mt-4 border-t border-slate-700/50 pt-4">
          <p className="text-slate-400 text-xs font-medium mb-3">AI-Generated Weekly Goals</p>
          <div className="space-y-2">
            {data.goals.map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        </div>
      )}
    </div>
  );
}
