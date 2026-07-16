import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Sync dark mode class on HTML document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load user profile on startup if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setWallet(data.wallet);
          setDarkMode(data.user.darkMode ?? true);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setWallet(data.wallet);
      setDarkMode(data.user.darkMode ?? true);
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Step 1 of registration: request an email verification code.
  const requestRegisterOtp = async (email) => {
    const res = await fetch(`${API_URL}/auth/register/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Could not send verification code');
    }
    return data;
  };

  // Step 2 of registration: verify code and create the account.
  const register = async (name, email, password, code) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, code })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setWallet(data.wallet);
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Forgot password: request a reset code by email.
  const requestPasswordReset = async (email) => {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Could not send reset code');
    }
    return data;
  };

  // Forgot password: verify code and set a new password.
  const resetPassword = async (email, code, newPassword) => {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Could not reset password');
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setWallet(null);
  };

  const updatePreferences = async (notificationPreferences, aiPreferences, newDarkMode) => {
    try {
      const body = {};
      if (notificationPreferences !== undefined) body.notificationPreferences = notificationPreferences;
      if (aiPreferences !== undefined) body.aiPreferences = aiPreferences;
      if (newDarkMode !== undefined) body.darkMode = newDarkMode;

      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        if (newDarkMode !== undefined) setDarkMode(newDarkMode);
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (err) {
      throw err;
    }
  };

  const refreshWalletBalance = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setWallet(data.wallet);
      }
    } catch (err) {
      console.error('Failed to refresh wallet balance:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        wallet,
        loading,
        darkMode,
        setDarkMode,
        login,
        register,
        requestRegisterOtp,
        requestPasswordReset,
        resetPassword,
        logout,
        updatePreferences,
        refreshWalletBalance
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
