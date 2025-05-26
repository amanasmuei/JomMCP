'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { authApi } from '@/lib/api/auth';
import { User, LoginRequest, RegisterRequest, AuthContextType } from '@/types/auth';
import { wsClient } from '@/lib/websocket';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);
      
      // Store tokens
      Cookies.set('access_token', response.access_token, { expires: 1 });
      Cookies.set('refresh_token', response.refresh_token, { expires: 7 });
      
      setUser(response.user);
      
      // Connect WebSocket with token
      wsClient.connect(response.access_token);
      
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const newUser = await authApi.register(data);
      toast.success('Registration successful! Please log in.');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      authApi.logout().catch(() => {
        // Ignore logout API errors
      });
    } finally {
      // Always clear local state
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      setUser(null);
      wsClient.disconnect();
      toast.success('Logged out successfully');
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = Cookies.get('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authApi.refreshToken(refreshToken);
      
      // Update tokens
      Cookies.set('access_token', response.access_token, { expires: 1 });
      Cookies.set('refresh_token', response.refresh_token, { expires: 7 });
      
      setUser(response.user);
      
      // Reconnect WebSocket with new token
      wsClient.connect(response.access_token);
    } catch (error) {
      // Refresh failed, logout user
      logout();
      throw error;
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get('access_token');
      
      if (token) {
        try {
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
          wsClient.connect(token);
        } catch (error) {
          // Token is invalid, try to refresh
          try {
            await refreshToken();
          } catch (refreshError) {
            // Refresh failed, clear tokens
            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
          }
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    refreshToken,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
