import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('mvp_admin_token');
      const storedUser = localStorage.getItem('mvp_admin_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Error loading stored auth state:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/admin/login', { email, password });
    const data = response.data;
    
    setToken(data.token);
    const userData = {
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      expiresAt: data.expiresAt
    };
    setUser(userData);

    localStorage.setItem('mvp_admin_token', data.token);
    localStorage.setItem('mvp_admin_user', JSON.stringify(userData));

    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mvp_admin_token');
    localStorage.removeItem('mvp_admin_user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      loading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
