import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ACTIVITY_CONFIG, EMISSION_FACTORS, estimateEmission } from '../utils/helpers';
import Navbar from '../components/Navbar';
import AutoTracker from '../components/AutoTracker';
import NLPActivityParser from '../components/NLPActivityParser';
import ImpactContext from '../components/ImpactContext';

// ── Smart pattern tip: compare current input to user's history ──────────────
function useSmartTip(type, category, value, userId) {
  const [tip, setTip] = useState(null);

  useEffect(() => {
    if (!type || !category || !value || !userId) { setTip(null); return; }
    api.get(`/activity/user/${userId}`)
      .then(({ data }) => {
        const acts = (data.activities || []).filter(a => a.type === type && a.category === category);
        if (acts.length < 2) { setTip(null); return; }
        const avg = acts.reduce((s, a) => s + a.value, 0) / acts.length;
        const diff = parseFloat(value) - avg;
        const pct = Math.round(Math.abs(diff / avg) * 100);
        if (pct < 10) { setTip(null); return; }
        setTip(diff > 0
          ? { type: 'warn', text: `${pct}% more than your usual ${avg.toFixed(1)} for this category.` }
          : { type: 'good', text: `${pct}% less than your usual ${avg.toFixed(1)} — great job!` }
        );
      })
      .catch(() => setTip(null));
  }, [type, category, value, userId]);

  return tip;
}

// ── Carbon budget indicator ──────────────────────────────────────────────────
function CarbonBudgetBadge({ emission }) {
  if (!emission) return null;
  const budget = 2.5;
  const pct = Math.round((emission / budget) * 100);
  const color = pct < 30 ? 'text-eco-400' : pct < 70 ? 'text-amber-400' : 'text-red-400';
  return (
    <span className={`text-xs font-medium ${color}`}>
      {pct}% of Paris target daily budget
    </span>
  );
}

export default function LogActivity() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: 'transportation',
    category: '',
    value: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [showImpact, setShowImpact] = useState(false);

  const currentConfig = ACTIVITY_CONFIG[form.type];
  const selectedCategory = currentConfig?.categories.find(c => c.value === form.category);
  const estimatedEmission = form.value && form.category
    ? estimateEmission(form.type, form.category, parseFloat(form.value))
    : null;

  const smartTip = useSmartTip(form.type, form.category, form.value, user?.id);

  // Auto-show impact panel when emission is calculated
  useEffect(() => {
    if (estimatedEmission !== null && estimatedEmission > 0) setShowImpact(true);
  }, [estimatedEmission]);

  const handleNLPParsed = ({ type, category, value }) => {
    setForm(f => ({ ...f, type, category, value: String(value) }));
    setError('');
  };

  const handleAutoTrack = ({ distanceKm, mode }) => {
    setForm(f => ({ ...f, type: 'transportation', category: mode, value: distanceKm.toFixed(2) }));
    setError('');
  };

  const handleTypeChange = (type) => {
    setForm(f => ({ ...f, type, category: '' }));
    setError('');
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) { setError('Please select a category'); return; }
    if (!form.value || parseFloat(form.value) <= 0) { setError('Please enter a valid value greater than 0'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/activity/add', {
        type: form.type,
        category: form.category,
        value: parseFloat(form.value),
        notes: form.notes,
        date: form.date
      });
      await refreshUser();
      setSuccess(res.data);
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log activity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 pt-32 pb-12 text-center">
          <div className="card animate-fade-in">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">Activity Logged!</h2>
            <p className="text-eco-400 text-lg font-semibold mb-1">
              +{success.activity?.emission?.toFixed(2)} kg CO₂
            </p>
            <p className="text-slate-400 text-sm mb-4">
              Your eco score is now <strong className="text-white">{success.stats?.newEcoScore}</strong>
            </p>
            {success.stats?.streak > 1 && (
              <p className="text-orange-400 text-sm">🔥 {success.stats.streak}-day streak!</p>
            )}
            {/* AI impact context on success */}
            {success.activity?.emission > 0 && (
              <div className="mt-4 text-left">
                <ImpactContext emissionKg={success.activity.emission} />
              </div>
            )}
            <p className="text-slate-500 text-xs mt-4">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Log Activity</h1>
          <p className="text-slate-400 text-sm mt-1">Track your daily carbon-emitting activities</p>
        </div>

        {/* ── AI Feature 1: Natural Language Parser ── */}
        <NLPActivityParser onParsed={handleNLPParsed} />

        {/* ── AI Auto GPS Tracker (transportation only) ── */}
        {form.type === 'transportation' && (
          <AutoTracker onApply={handleAutoTrack} />
        )}

        {/* Activity Type Selector */}
        <div className="card mb-4">
          <h3 className="text-slate-300 font-medium text-sm mb-3">Activity Type</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(ACTIVITY_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => handleTypeChange(key)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                  form.type === key
                    ? 'border-eco-600 bg-eco-600/15 text-eco-400'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                }`}
              >
                <span className="text-2xl">{cfg.icon}</span>
                <span className="text-xs font-medium">{cfg.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="card space-y-5">

            {/* Category */}
            <div>
              <label className="label">Category *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {currentConfig?.categories.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 ${
                      form.category === cat.value
                        ? 'border-eco-600 bg-eco-600/15 text-eco-300'
                        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <div>
                      <p className="text-xs font-medium">{cat.label}</p>
                      <p className="text-xs opacity-60">{cat.unit}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Value */}
            <div>
              <label className="label">
                Amount {selectedCategory ? `(${selectedCategory.unit})` : ''} *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="value"
                  value={form.value}
                  onChange={handleChange}
                  className="input-field pr-20"
                  placeholder={`Enter ${selectedCategory?.unit || 'amount'}`}
                  min="0"
                  step="0.1"
                />
                {selectedCategory && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                    {selectedCategory.unit}
                  </span>
                )}
              </div>

              {/* ── AI Feature 2: Emission preview + carbon budget badge ── */}
              {estimatedEmission !== null && (
                <div className={`mt-2 flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm ${
                  estimatedEmission === 0
                    ? 'bg-eco-500/10 border border-eco-700/30 text-eco-400'
                    : estimatedEmission < 2
                    ? 'bg-eco-500/10 border border-eco-700/30 text-eco-400'
                    : estimatedEmission < 5
                    ? 'bg-amber-500/10 border border-amber-700/30 text-amber-400'
                    : 'bg-red-500/10 border border-red-700/30 text-red-400'
                }`}>
                  <span className="flex items-center gap-2">
                    <span>{estimatedEmission === 0 ? '🌟' : estimatedEmission < 2 ? '🌿' : estimatedEmission < 5 ? '⚠️' : '🔴'}</span>
                    <span>Est. <strong>{estimatedEmission.toFixed(2)} kg CO₂</strong></span>
                  </span>
                  <CarbonBudgetBadge emission={estimatedEmission} />
                </div>
              )}

              {/* ── AI Feature 3: Smart pattern tip ── */}
              {smartTip && (
                <div className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  smartTip.type === 'warn'
                    ? 'bg-amber-500/10 border border-amber-700/30 text-amber-300'
                    : 'bg-eco-500/10 border border-eco-700/30 text-eco-300'
                }`}>
                  <span>{smartTip.type === 'warn' ? '📊' : '✨'}</span>
                  <span>AI Insight: {smartTip.text}</span>
                </div>
              )}

              {/* ── AI Feature 4: Impact Context (expandable) ── */}
              {estimatedEmission !== null && estimatedEmission > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowImpact(s => !s)}
                    className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                  >
                    <span>{showImpact ? '▲' : '▼'}</span>
                    {showImpact ? 'Hide' : 'Show'} AI impact analysis
                  </button>
                  {showImpact && <ImpactContext emissionKg={estimatedEmission} />}
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="input-field"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="label">Notes <span className="text-slate-600">(optional)</span></label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="input-field resize-none"
                rows={3}
                placeholder="Add any additional details..."
                maxLength={200}
              />
              <p className="text-slate-600 text-xs mt-1 text-right">{form.notes.length}/200</p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-700/40 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Logging...
                  </span>
                ) : 'Log Activity'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
