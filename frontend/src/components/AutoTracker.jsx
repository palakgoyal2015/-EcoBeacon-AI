import React from 'react';
import useGeoTracker from '../hooks/useGeoTracker';
import { formatDistance, formatSpeed } from '../utils/geoTracking';

const formatDuration = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export default function AutoTracker({ onApply }) {
  const tracker = useGeoTracker();

  const handleApply = () => {
    if (!tracker.detectedMode || tracker.distanceKm === 0) return;
    onApply({
      distanceKm: parseFloat(tracker.distanceKm.toFixed(3)),
      mode: tracker.detectedMode.mode
    });
    tracker.reset();
  };

  return (
    <div className="card mb-4 border border-blue-700/40 bg-blue-950/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📍</span>
          <div>
            <p className="text-white font-semibold text-sm">AI Distance Tracker</p>
            <p className="text-slate-400 text-xs">Automatically detects distance & transport mode</p>
          </div>
        </div>
        {tracker.status === 'tracking' && (
          <span className="flex items-center gap-1.5 text-xs text-eco-400 bg-eco-500/10 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-eco-400 rounded-full animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Error */}
      {tracker.status === 'error' && (
        <div className="mb-3 p-3 bg-red-500/10 border border-red-700/30 rounded-xl text-red-400 text-sm">
          {tracker.errorMsg}
        </div>
      )}

      {/* Tracking stats */}
      {(tracker.status === 'tracking' || tracker.status === 'stopped') && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-slate-800/60 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Distance</p>
            <p className="text-white font-bold text-base">{formatDistance(tracker.distanceKm)}</p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Speed</p>
            <p className="text-white font-bold text-base">
              {tracker.status === 'tracking' ? formatSpeed(tracker.currentSpeedKmh) : '—'}
            </p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Duration</p>
            <p className="text-white font-bold text-base">{formatDuration(tracker.duration)}</p>
          </div>
        </div>
      )}

      {/* AI detected mode */}
      {tracker.detectedMode && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <span className="text-xl">{tracker.detectedMode.icon}</span>
          <div>
            <p className="text-xs text-slate-400">AI Detected Mode</p>
            <p className={`text-sm font-semibold ${tracker.detectedMode.color}`}>
              {tracker.detectedMode.label}
            </p>
          </div>
          <span className="ml-auto text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded-full">
            auto-detected
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {tracker.status === 'idle' || tracker.status === 'error' ? (
          <button
            type="button"
            onClick={tracker.start}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all"
          >
            <span>▶</span> Start Tracking
          </button>
        ) : tracker.status === 'requesting' ? (
          <button type="button" disabled className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-400 text-sm cursor-not-allowed">
            <span className="flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 border-2 border-slate-500 border-t-slate-300 rounded-full animate-spin" />
              Requesting GPS...
            </span>
          </button>
        ) : tracker.status === 'tracking' ? (
          <>
            <button
              type="button"
              onClick={tracker.stop}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-all"
            >
              ⏹ Stop
            </button>
            <button
              type="button"
              onClick={tracker.reset}
              className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-all"
            >
              Reset
            </button>
          </>
        ) : tracker.status === 'stopped' ? (
          <>
            <button
              type="button"
              onClick={handleApply}
              disabled={!tracker.detectedMode || tracker.distanceKm === 0}
              className="flex-1 py-2.5 rounded-xl bg-eco-600 hover:bg-eco-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium transition-all"
            >
              ✓ Use This Trip ({formatDistance(tracker.distanceKm)})
            </button>
            <button
              type="button"
              onClick={tracker.reset}
              className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-all"
            >
              Discard
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
