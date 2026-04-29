import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getCategoryColor, getCategoryIcon } from '../utils/helpers';

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  if (percentage < 5) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold">
      {`${percentage.toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl">
      <div className="flex items-center gap-2">
        <span>{getCategoryIcon(d.name)}</span>
        <span className="text-white font-medium capitalize">{d.name}</span>
      </div>
      <p className="text-eco-400 font-bold mt-1">{d.value} kg CO₂</p>
      <p className="text-slate-400 text-xs">{d.percentage}% of total</p>
    </div>
  );
};

export default function ActivityBreakdown({ data = [], loading = false }) {
  if (loading) {
    return (
      <div className="card-hover h-72 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-eco-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasData = data.length > 0 && data.some(d => d.value > 0);

  return (
    <div className="card-hover">
      <div className="mb-6">
        <h3 className="font-semibold text-white">Activity Breakdown</h3>
        <p className="text-slate-500 text-xs mt-0.5">Monthly emissions by category</p>
      </div>

      {!hasData ? (
        <div className="h-56 flex flex-col items-center justify-center text-slate-500 gap-3">
          <span className="text-4xl opacity-50">🥧</span>
          <p className="text-sm">No activities logged yet</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={getCategoryColor(entry.name)}
                        style={{ filter: `drop-shadow(0 0 4px ${getCategoryColor(entry.name)}50)` }} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {data.map(item => (
              <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                <span className="text-base">{getCategoryIcon(item.name)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-xs capitalize font-medium truncate">{item.name}</p>
                  <p className="text-white text-xs font-bold">{item.value} kg</p>
                </div>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                      style={{ background: `${getCategoryColor(item.name)}20`, color: getCategoryColor(item.name) }}>
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
