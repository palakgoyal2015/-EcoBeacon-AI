import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatEmission } from '../utils/helpers';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import EcoScoreGauge from '../components/EcoScoreGauge';
import EmissionChart from '../components/EmissionChart';
import ActivityBreakdown from '../components/ActivityBreakdown';
import SuggestionsPanel from '../components/SuggestionsPanel';
import BadgesPanel from '../components/BadgesPanel';
import ForecastPanel from '../components/ForecastPanel';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [summary, setSummary] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);
  const [activitiesAnalyzed, setActivitiesAnalyzed] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      const [summaryRes, activityRes] = await Promise.all([
        api.get(`/emissions/summary/${user._id}`),
        api.get(`/activity/user/${user._id}?limit=10`)
      ]);
      setSummary(summaryRes.data);
      setActivities(activityRes.data.activities || []);
    } catch (err) {
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchSuggestions = useCallback(async () => {
    if (!user) return;
    setAiLoading(true);
    try {
      const res = await api.get(`/ai/suggestions/${user._id}`);
      setSuggestions(res.data.suggestions || []);
      setActivitiesAnalyzed(res.data.activitiesAnalyzed || 0);
    } catch (err) {
      console.error('AI suggestions error:', err);
    } finally {
      setAiLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshUser();
    fetchDashboardData();
    fetchSuggestions();
  }, []);

  const recentActivity = activities[0];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {recentActivity
                ? `Last activity: ${new Date(recentActivity.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`
                : 'Start tracking your carbon footprint today'}
            </p>
          </div>
          <Link to="/log" className="btn-primary flex items-center gap-2">
            <span>➕</span>
            <span className="hidden sm:inline">Log Activity</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Today's Emissions"
            value={loading ? '—' : formatEmission(summary?.summary?.daily)}
            unit="kg CO₂"
            icon="📅"
            color="blue"
            subtitle="Current day"
          />
          <StatsCard
            title="This Week"
            value={loading ? '—' : formatEmission(summary?.summary?.weekly)}
            unit="kg CO₂"
            icon="📆"
            color="yellow"
            subtitle="Last 7 days"
          />
          <StatsCard
            title="This Month"
            value={loading ? '—' : formatEmission(summary?.summary?.monthly)}
            unit="kg CO₂"
            icon="🗓️"
            color="purple"
            subtitle="Current month"
          />
          <StatsCard
            title="Eco Score"
            value={user?.ecoScore ?? 50}
            unit="/ 100"
            icon="🌿"
            color="green"
            subtitle={user?.ecoScore >= 80 ? 'Excellent!' : user?.ecoScore >= 50 ? 'Good progress' : 'Keep improving'}
          />
        </div>

        {/* Middle Row: Chart + Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <EmissionChart
              data={summary?.dailyBreakdown || []}
              loading={loading}
            />
          </div>
          <div>
            <EcoScoreGauge score={user?.ecoScore ?? 50} />
          </div>
        </div>

        {/* Bottom Row: Breakdown + Suggestions + Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <ActivityBreakdown
            data={summary?.categoryBreakdown || []}
            loading={loading}
          />
          <div className="lg:col-span-2">
            <SuggestionsPanel
              suggestions={suggestions}
              loading={aiLoading}
              activitiesAnalyzed={activitiesAnalyzed}
            />
          </div>
        </div>

        {/* AI Forecast + Badges + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ForecastPanel userId={user?._id} />
          <BadgesPanel badges={user?.badges || []} streak={user?.streak || 0} />
        </div>

        {/* Recent Activity */}
        <div className="card-hover">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Recent Activities</h3>
              <Link to="/log" className="text-eco-400 hover:text-eco-300 text-sm">+ Add new</Link>
            </div>
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-3">
                <span className="text-4xl opacity-40">📝</span>
                <p className="text-sm">No activities logged yet</p>
                <Link to="/log" className="btn-primary text-sm py-2">Log your first activity</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {activities.slice(0, 6).map(a => (
                  <div key={a._id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center text-lg flex-shrink-0">
                      {a.type === 'transportation' ? '🚗' : a.type === 'electricity' ? '⚡' : a.type === 'food' ? '🍽️' : '🛍️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm font-medium capitalize">
                        {a.category.replace('-', ' ')} <span className="text-slate-500 font-normal capitalize">({a.type})</span>
                      </p>
                      <p className="text-slate-500 text-xs">{new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-red-400 text-sm font-semibold">{a.emission.toFixed(2)}</p>
                      <p className="text-slate-500 text-xs">kg CO₂</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
