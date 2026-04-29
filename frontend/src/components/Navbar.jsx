import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getScoreColor, getScoreLabel } from '../utils/helpers';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/log', label: 'Log Activity', icon: '➕' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <span className="text-2xl">🌱</span>
            <span className="font-bold text-lg text-white group-hover:text-eco-400 transition-colors">
              EcoBeacon <span className="text-eco-500">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === path
                    ? 'bg-eco-600/20 text-eco-400 border border-eco-700/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{icon}</span>
                {label}
              </Link>
            ))}
          </div>

          {/* User Info & Eco Score */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-200">{user.name}</p>
                  <p className="text-xs" style={{ color: getScoreColor(user.ecoScore) }}>
                    {getScoreLabel(user.ecoScore)} • Score: {user.ecoScore}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2"
                  style={{ borderColor: getScoreColor(user.ecoScore), color: getScoreColor(user.ecoScore), background: `${getScoreColor(user.ecoScore)}20` }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors text-sm px-3 py-2 rounded-lg hover:bg-red-500/10">
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-2">
          {navLinks.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === path
                  ? 'bg-eco-600/20 text-eco-400 border border-eco-700/50'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
          <button
            onClick={() => { handleLogout(); setMenuOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
