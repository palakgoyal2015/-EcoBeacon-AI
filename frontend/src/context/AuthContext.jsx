import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('eco_token'));
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await api.get('/auth/profile');
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('eco_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, token: newToken } = res.data;
    localStorage.setItem('eco_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { user: userData, token: newToken } = res.data;
    localStorage.setItem('eco_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('eco_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/profile');
      setUser(res.data.user);
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
