import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '@/types';
import { AUTH_TOKEN_KEY } from '@/services/api';

interface AuthContextValue {
  currentUser: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => Promise<void>;
  signup: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem('@streamverse/user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setCurrentUser(JSON.parse(storedUser));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (newToken: string, newUser: AuthUser) => {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken);
    await AsyncStorage.setItem('@streamverse/user', JSON.stringify(newUser));
    setToken(newToken);
    setCurrentUser(newUser);
  }, []);

  const signup = useCallback(async (newToken: string, newUser: AuthUser) => {
    await login(newToken, newUser);
  }, [login]);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, '@streamverse/user']);
    setToken(null);
    setCurrentUser(null);
  }, []);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ currentUser, token, loading, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
