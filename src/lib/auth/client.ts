/**
 * Cliente de autenticación unificado
 * Maneja todas las operaciones de autenticación de manera elegante
 */

import { User, AuthResult, AuthMethod } from './types';
import { detectAuthMethod, getLogoutEndpoint } from './detector';

export class AuthClient {
  private static instance: AuthClient;
  
  private constructor() {}
  
  static getInstance(): AuthClient {
    if (!AuthClient.instance) {
      AuthClient.instance = new AuthClient();
    }
    return AuthClient.instance;
  }

  /**
   * Verifica la autenticación usando el método más apropiado
   */
  async checkAuth(forceRefresh = false): Promise<AuthResult> {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [AUTH CLIENT] Starting auth check...', forceRefresh ? '(force refresh)' : '');
    }

    // Estrategia: Intentar NextAuth primero (para usuarios de Google)
    // Si falla, intentar JWT (para usuarios normales)
    
    // 1. Intentar NextAuth primero
    const nextAuthResult = await this.checkNextAuth(forceRefresh);
    if (nextAuthResult.success) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [AUTH CLIENT] NextAuth successful');
      }
      return nextAuthResult;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ [AUTH CLIENT] NextAuth failed, trying JWT...');
    }

    // 2. Si NextAuth falla, intentar JWT
    const jwtResult = await this.checkJWT();
    if (jwtResult.success) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [AUTH CLIENT] JWT successful');
      }
      return jwtResult;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('❌ [AUTH CLIENT] Both auth methods failed');
    }

    return { success: false, method: 'none', error: 'No authentication found' };
  }

  /**
   * Verifica autenticación NextAuth
   */
  private async checkNextAuth(forceRefresh = false): Promise<AuthResult> {
    try {
      // Intentar con el endpoint específico de NextAuth primero
      let url = '/api/auth/me-nextauth';
      if (forceRefresh) {
        url += `?t=${Date.now()}`;
      }
      let response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ [AUTH CLIENT] NextAuth user found:', data.user);
          }
          return { success: true, user: data.user, method: 'nextauth' };
        }
      }

      // Si falla, intentar con el endpoint unificado
      url = '/api/user/me';
      if (forceRefresh) {
        url += `?t=${Date.now()}`;
      }
      response = await fetch(url, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ [AUTH CLIENT] Unified user found:', data.user);
          }
          return { success: true, user: data.user, method: 'nextauth' };
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ [AUTH CLIENT] NextAuth check failed:', error);
      }
    }
    return { success: false, method: 'nextauth', error: 'NextAuth verification failed' };
  }

  /**
   * Verifica autenticación JWT
   */
  private async checkJWT(): Promise<AuthResult> {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ [AUTH CLIENT] JWT user found:', data.user);
          }
          return { success: true, user: data.user, method: 'jwt' };
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ [AUTH CLIENT] JWT check failed:', error);
      }
    }
    return { success: false, method: 'jwt', error: 'JWT verification failed' };
  }

  /**
   * Realiza login
   */
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [AUTH CLIENT] Login successful:', data.user);
        }
        return { success: true, user: data.user, method: 'jwt' };
      }
      
      return { success: false, error: data.error || 'Login failed' };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ [AUTH CLIENT] Login error:', error);
      }
      return { success: false, error: 'Network error during login' };
    }
  }

  /**
   * Realiza logout elegante
   */
  async logout(user?: User | null): Promise<{ success: boolean; error?: string }> {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [AUTH CLIENT] Starting logout process...');
      }

      const endpoint = getLogoutEndpoint(user);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [AUTH CLIENT] Using logout endpoint:', endpoint);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [AUTH CLIENT] Logout successful:', data);
        }
        return { success: true };
      }

      return { success: false, error: 'Logout failed' };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ [AUTH CLIENT] Logout error:', error);
      }
      return { success: false, error: 'Network error during logout' };
    }
  }

  /**
   * Limpia cookies del cliente
   */
  clearClientCookies(): void {
    const authCookies = [
      'auth-token',
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url'
    ];

    authCookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 [AUTH CLIENT] Client cookies cleared');
    }
  }
}
