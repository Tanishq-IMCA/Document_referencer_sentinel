'use client';

import { useState, useCallback, useEffect } from 'react';
import { User } from '@/types';
import { mockUser } from '@/lib/queryClient';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    setState(s => ({ ...s, isLoading: true }));
    await new Promise(r => setTimeout(r, 1200));
    const user = { ...mockUser, email };
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_token', 'mock_jwt_token');
    setState({ user, isAuthenticated: true, isLoading: false });
    return user;
  }, []);

  const loginWithGithub = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true }));
    await new Promise(r => setTimeout(r, 1500));
    const user = mockUser;
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_token', 'mock_github_token');
    setState({ user, isAuthenticated: true, isLoading: false });
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setState(s => {
      if (!s.user) return s;
      const updated = { ...s.user, ...updates };
      localStorage.setItem('auth_user', JSON.stringify(updated));
      return { ...s, user: updated };
    });
  }, []);

  return { ...state, login, loginWithGithub, logout, updateUser };
}
