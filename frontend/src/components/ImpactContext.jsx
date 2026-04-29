import React from 'react';

const DAILY_BUDGET_KG = 7.5;   // world avg per person per day
const PARIS_TARGET_KG = 2.5;   // Paris Agreement per-person per-day target

const equivalents = (kg) => [
  {
    icon: '🌳',
    label: 'Trees needed (1 day)',
    value: (kg / 0.058).toFixed(1),
    unit: 'trees',
    description: 'A tree absorbs ~21 kg CO₂/year (~0.058 kg/day)',
  },
  {
    icon: '📱',
    label: 'Phone charges',
    value: Math.round(kg / 0.008),
    unit: 'charges',
    description: 'Charging a smartphone uses ~0.008 kg CO₂',
  },
  {
    icon: '📺',
    label: 'LED TV hours',
    value: Math.round(kg / 0.1),
    unit: 'hours',
    description: 'Watching a 32" LED TV emits ~0.1 kg CO₂/hour',
  },
  {
    icon: '🚿',
    label: 'Hot showers',
    value: (kg / 0.5).toFixed(1),
    unit: 'showers',
    description: 'A 10-min hot shower emits ~0.5 kg CO₂',
  },
];

function BudgetBar({ kg }) {
  const worldPct = Math.min((kg / DAILY_BUDGET_KG) * 100, 100);
  const parisPct = Math.min((kg / PARIS_TARGET_KG) * 100, 100);
  const worldColor = worldPct < 40 ? 'bg-eco-500' : worldPct < 75 ? 'bg-amber-500' : 'bg-red-500';
  const parisColor = parisPct < 40 ? 'bg-eco-500' : parisPct < 75 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-2.5">
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>World avg daily budget ({DAILY_BUDGET_KG} kg)</span>
          <span className={worldPct >= 100 ? 'text-red-400 font-medium' : 'text-slate-300'}>
            {worldPct.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${worldColor}`}
            style={{ width: `${worldPct}%` }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Paris Agreement target ({PARIS_TARGET_KG} kg)</span>
          <span className={parisPct >= 100 ? 'text-red-400 font-medium' : 'text-slate-300'}>
            {parisPct.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${parisColor}`}
            style={{ width: `${parisPct}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function ImpactContext({ emissionKg }) {
  if (!emissionKg || emissionKg <= 0) return null;

  const eq = equivalents(emissionKg);
  const impactLevel = emissionKg < 1 ? 'low' : emissionKg < 5 ? 'medium' : 'high';
  const impactConfig = {
    low:    { color: 'border-eco-700/40 bg-eco-950/30', title: 'text-eco-300',    badge: 'bg-eco-900/50 text-eco-400',    label: 'Low Impact' },
    medium: { color: 'border-amber-700/40 bg-amber-950/20', title: 'text-amber-300', badge: 'bg-amber-900/50 text-amber-400', label: 'Moderate Impact' },
    high:   { color: 'border-red-700/40 bg-red-950/20',    title: 'text-red-300',   badge: 'bg-red-900/50 text-red-400',     label: 'High Impact' },
  }[impactLevel];

  return (
    <div className={`mt-3 rounded-xl border p-4 ${impactConfig.color}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🔍</span>
        <h4 className={`text-sm font-semibold ${impactConfig.title}`}>AI Impact Analysis</h4>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${impactConfig.badge}`}>
          {impactConfig.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {eq.map(item => (
          <div key={item.label} className="bg-slate-800/50 rounded-lg p-2.5 text-center" title={item.description}>
            <div className="text-xl mb-1">{item.icon}</div>
            <div className="text-white font-bold text-sm">{item.value} <span className="text-xs font-normal text-slate-400">{item.unit}</span></div>
            <div className="text-slate-500 text-xs leading-tight mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-700/50 pt-3">
        <p className="text-xs text-slate-400 mb-2 font-medium">% of your daily CO₂ budget used by this activity:</p>
        <BudgetBar kg={emissionKg} />
      </div>
    </div>
  );
}
