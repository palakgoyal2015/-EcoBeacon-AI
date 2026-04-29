import React from 'react';
import { getScoreColor, getScoreLabel, getScoreEmoji } from '../utils/helpers';

export default function EcoScoreGauge({ score = 50 }) {
  const safeScore = Math.min(100, Math.max(0, score));
  const color = getScoreColor(safeScore);
  const label = getScoreLabel(safeScore);
  const emoji = getScoreEmoji(safeScore);

  // SVG arc parameters
  const radius = 80;
  const strokeWidth = 14;
  const cx = 110;
  const cy = 100;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;

  const polarToCartesian = (angle) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad)
    };
  };

  const describeArc = (start, end) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  const scoreAngle = startAngle + (safeScore / 100) * totalAngle;
  const needle = polarToCartesian(scoreAngle);

  const ticks = [0, 25, 50, 75, 100];

  return (
    <div className="card-hover flex flex-col items-center">
      <h3 className="text-slate-300 font-semibold text-sm mb-4">Eco Score</h3>

      <div className="relative">
        <svg width="220" height="160" viewBox="0 0 220 160">
          {/* Background arc */}
          <path
            d={describeArc(startAngle, endAngle)}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Colored fill arc */}
          {safeScore > 0 && (
            <path
              d={describeArc(startAngle, scoreAngle)}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
            />
          )}

          {/* Tick marks */}
          {ticks.map((tick) => {
            const angle = startAngle + (tick / 100) * totalAngle;
            const outer = polarToCartesian(angle);
            const innerR = radius - strokeWidth / 2 - 8;
            const inner = {
              x: cx + innerR * Math.cos((angle * Math.PI) / 180),
              y: cy + innerR * Math.sin((angle * Math.PI) / 180)
            };
            return (
              <g key={tick}>
                <line
                  x1={inner.x} y1={inner.y}
                  x2={outer.x} y2={outer.y}
                  stroke="#475569" strokeWidth="1.5"
                />
              </g>
            );
          })}

          {/* Needle dot */}
          <circle cx={needle.x} cy={needle.y} r="6" fill={color}
                  style={{ filter: `drop-shadow(0 0 4px ${color})` }} />

          {/* Center score */}
          <text x={cx} y={cy - 4} textAnchor="middle" fill="white"
                fontSize="36" fontWeight="bold" fontFamily="sans-serif">
            {safeScore}
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" fill={color}
                fontSize="12" fontFamily="sans-serif">
            {label}
          </text>

          {/* Labels */}
          <text x="30" y="148" textAnchor="middle" fill="#64748b" fontSize="10">0</text>
          <text x="190" y="148" textAnchor="middle" fill="#64748b" fontSize="10">100</text>
        </svg>
      </div>

      <div className="text-center mt-1">
        <span className="text-2xl">{emoji}</span>
        <p className="text-slate-400 text-xs mt-1">
          {safeScore >= 80 ? 'Keep up the great work!' : safeScore >= 50 ? 'Good progress, keep going!' : 'Small changes, big impact!'}
        </p>
      </div>

      {/* Score band indicator */}
      <div className="flex gap-3 mt-4 text-xs">
        {[
          { range: '0–49', label: 'Improve', color: '#ef4444' },
          { range: '50–79', label: 'Moderate', color: '#f59e0b' },
          { range: '80–100', label: 'Excellent', color: '#10b981' }
        ].map(band => (
          <div key={band.range} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: band.color }} />
            <span className="text-slate-500">{band.range}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
