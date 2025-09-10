/**
 * Contexto de autenticación elegante y unificado
 */

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthClient } from './client';
import { User, AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const authClient = AuthClient.getInstance();

  const checkAuth = async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      // No verificar autenticación si estamos en proceso de logout
      if (isLoggingOut) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 [AUTH CONTEXT] Skipping auth check - logout in progress');
        }
        return;
      }

      if (!silent) setLoading(true);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [AUTH CONTEXT] Checking authentication...');
      }

      const result = await authClient.checkAuth();
      
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        setUser(null);
      }
      
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ [AUTH CONTEXT] Auth check error:', error);
      }
      setUser(null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const result = await authClient.login(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      }
      
      return { success: false, error: result.error || 'Login failed' };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ [AUTH CONTEXT] Login error:', error);
      }
      return { success: false, error: 'Network error during login' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [AUTH CONTEXT] Starting logout process...');
      }
      
      // Marcar que estamos en proceso de logout
      setIsLoggingOut(true);
      
      // Limpiar estado local primero
      setUser(null);
      setLoading(false);

      // Realizar logout en el servidor
      const result = await authClient.logout(user);
      
      if (!result.success) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ [AUTH CONTEXT] Server logout failed, continuing with client cleanup');
        }
      }

      // Limpiar cookies del cliente
      authClient.clearClientCookies();

      // Esperar un momento para que las cookies se propaguen
      await new Promise(resolve => setTimeout(resolve, 200));

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [AUTH CONTEXT] Logout completed, redirecting...');
      }

      // Redirigir al login
      window.location.href = '/login?from=logout';
      
    } catch (error) {
      console.error('❌ [AUTH CONTEXT] Logout error:', error);
      setUser(null);
      setLoading(false);
      setIsLoggingOut(false);
      window.location.href = '/login';
    }
  };

  const setAuthUser = (newUser: User | null) => {
    setUser(newUser);
    setLoading(false);
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    // Pequeño delay para asegurar que las cookies estén disponibles
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isLoggingOut,
    login,
    logout,
    checkAuth,
    refetch: checkAuth,
    setAuthUser,
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
