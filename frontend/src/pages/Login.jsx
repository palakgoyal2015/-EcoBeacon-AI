import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-eco-950 to-slate-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-eco-900/30 via-transparent to-transparent" />
        <div className="relative text-center">
          <div className="text-8xl mb-6">🌱</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Track Your <span className="text-gradient">Carbon Footprint</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-sm mx-auto leading-relaxed">
            AI-powered insights to help you live more sustainably and reduce your environmental impact.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {[
              { icon: '📊', label: 'Track Daily Activities' },
              { icon: '🤖', label: 'AI Recommendations' },
              { icon: '🏆', label: 'Earn Eco Badges' }
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-2 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/30">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-slate-400 text-xs text-center">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <span className="text-5xl">🌱</span>
            <h1 className="text-2xl font-bold text-white mt-3">EcoBeacon AI</h1>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-slate-400 text-sm mb-6">Sign in to continue your eco journey</p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-700/40 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-5 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <p className="text-slate-400 text-xs font-medium mb-1">Demo credentials:</p>
              <p className="text-slate-300 text-xs">alex@ecobeacon.com / password123</p>
            </div>

            <p className="text-center text-slate-400 text-sm mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="text-eco-400 hover:text-eco-300 font-medium">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
