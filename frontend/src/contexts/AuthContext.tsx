import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthLogin } from '../api/auth/auth-login';
import { api } from '../lib/api';
import { AUTH_TOKEN_CONSTANT } from '../constants/auth-token-constants';
import { AuthMe } from '../api/auth/auth-me';


export type UserRole = 'admin' | 'pastor' | 'lider' | 'membro';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user?: User;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuth: boolean;
  isLoading: boolean;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const DEFAULT_VALUE: AuthContextType = {
  isAuth: false,
  isLoading: true,
  login: async () => { },
  logout: async () => { },
  user: undefined,
  hasPermission: () => false
} as const

export const AuthContext = createContext<AuthContextType>(DEFAULT_VALUE);

const roleHierarchy: Record<UserRole, number> = {
  membro: 1,
  lider: 2,
  pastor: 3,
  admin: 4,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  const [user, setUser] = useState<AuthContextType["user"]>(DEFAULT_VALUE.user);
  const [isAuth, setIsAuth] = useState<boolean>(DEFAULT_VALUE.isAuth);
  const [isLoading, setIsLoading] = useState<boolean>(DEFAULT_VALUE.isLoading);

// Hooks

const logout = async () => {
  setUser(undefined);
  setIsAuth(false);
  setIsLoading(false);

  localStorage.removeItem(AUTH_TOKEN_CONSTANT);
};

const login: AuthContextType["login"] = async (email, password) => {
  if (!email || !password) {
    throw new Error("E-mail and password are required.")
  }

  const { user, token } = await AuthLogin({ email, password })

  setUser(user)
  setIsAuth(true)

  localStorage.setItem(AUTH_TOKEN_CONSTANT, token)
  api.defaults.headers["Authorization"] = `Bearer ${token}`

};

const checkSession = async () => {
  const token = localStorage.getItem(AUTH_TOKEN_CONSTANT);

    if (!token) {
        setIsLoading(false);
        return;
    }

  try {
    const user = await AuthMe()

    if(!user) {
      throw new Error("User not found")
    }

    setUser(user)
    setIsAuth(true)
  } catch {
    logout()
  } finally {
    setIsLoading(false)
  }
}

const hasPermission = (requiredRole: UserRole): boolean => {
  if (!user) return false; 
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};

useEffect(() => {
  setIsLoading(true)

  const token = localStorage.getItem(AUTH_TOKEN_CONSTANT)

  if(!token) {
    setIsLoading(false)
    return
  }

  api.defaults.headers["Authorization"] = `Bearer ${token}`
  
  checkSession()
}, []);

return (
  <AuthContext.Provider value={
    {
      isAuth,
      isLoading,
      login,
      logout,
      user,
      hasPermission
    }
  }>
    {children}
  </AuthContext.Provider>
);
};