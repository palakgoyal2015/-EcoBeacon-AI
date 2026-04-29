import React, { useState } from 'react';
import { getCategoryColor } from '../utils/helpers';

const priorityConfig = {
  high:   { label: 'High Impact', bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-700/30' },
  medium: { label: 'Medium',      bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-700/30' },
  low:    { label: 'Low',         bg: 'bg-slate-500/10',  text: 'text-slate-400',  border: 'border-slate-700/30' }
};

export default function SuggestionsPanel({ suggestions = [], loading = false, activitiesAnalyzed = 0 }) {
  const [expanded, setExpanded] = useState(null);

  if (loading) {
    return (
      <div className="card-hover">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🤖</span>
          <h3 className="font-semibold text-white">AI Recommendations</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-hover">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-eco-500/15 rounded-xl flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Recommendations</h3>
            <p className="text-slate-500 text-xs">
              {activitiesAnalyzed > 0 ? `Based on ${activitiesAnalyzed} activities` : 'Personalized suggestions'}
            </p>
          </div>
        </div>
        <span className="badge bg-eco-500/15 text-eco-400 border border-eco-700/30">
          {suggestions.length} tips
        </span>
      </div>

      {suggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-3">
          <span className="text-4xl opacity-50">💡</span>
          <p className="text-sm text-center">Log some activities to get personalized AI recommendations!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s, idx) => {
            const pc = priorityConfig[s.priority] || priorityConfig.low;
            const isOpen = expanded === s.id;

            return (
              <div
                key={s.id}
                className={`rounded-xl border ${pc.border} ${pc.bg} transition-all duration-200 cursor-pointer overflow-hidden`}
                onClick={() => setExpanded(isOpen ? null : s.id)}
              >
                <div className="flex items-center gap-3 p-3.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                       style={{ background: `${getCategoryColor(s.type)}15` }}>
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-slate-100 text-sm font-semibold">{s.title}</p>
                      <span className={`badge ${pc.bg} ${pc.text} border ${pc.border} text-xs`}>
                        {pc.label}
                      </span>
                    </div>
                    {!isOpen && (
                      <p className="text-slate-500 text-xs mt-0.5 truncate">{s.description}</p>
                    )}
                  </div>
                  {s.savings !== '0' && s.savings !== '∞' && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-eco-400 font-bold text-sm">-{s.savings}</p>
                      <p className="text-slate-500 text-xs">kg CO₂</p>
                    </div>
                  )}
                  <span className={`text-slate-500 text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                </div>

                {isOpen && (
                  <div className="px-3.5 pb-3.5 border-t border-slate-700/50 pt-3">
                    <p className="text-slate-300 text-sm leading-relaxed">{s.description}</p>
                    {s.savings !== '0' && (
                      <div className="flex items-center gap-2 mt-3 p-2 bg-eco-500/10 rounded-lg border border-eco-700/30">
                        <span>💚</span>
                        <p className="text-eco-300 text-xs">
                          <strong>Potential saving:</strong> {s.savings === '∞' ? 'Immeasurable community impact' : `~${s.savings} kg CO₂`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
