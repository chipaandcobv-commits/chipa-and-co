/**
 * Detector inteligente de tipo de autenticación
 * Determina qué método de autenticación está disponible y activo
 */

export type AuthMethod = 'jwt' | 'nextauth' | 'none';

export interface AuthDetection {
  method: AuthMethod;
  hasJWT: boolean;
  hasNextAuth: boolean;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Detecta qué tipo de autenticación está disponible
 */
export function detectAuthMethod(): AuthDetection {
  const hasJWT = document.cookie.includes('auth-token=');
  const hasNextAuth = document.cookie.includes('next-auth.session-token=');
  const hasNextAuthCSRF = document.cookie.includes('next-auth.csrf-token=');

  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [DETECTOR] Cookie analysis:', {
      allCookies: document.cookie,
      hasJWT,
      hasNextAuth,
      hasNextAuthCSRF,
      jwtSearch: 'auth-token=',
      nextAuthSearch: 'next-auth.session-token=',
      nextAuthCSRFSearch: 'next-auth.csrf-token='
    });
  }

  // Lógica de detección inteligente
  // Si hay cookies de NextAuth (incluso solo CSRF), asumir NextAuth
  if ((hasNextAuth || hasNextAuthCSRF) && !hasJWT) {
    return {
      method: 'nextauth',
      hasJWT,
      hasNextAuth: hasNextAuth || hasNextAuthCSRF,
      confidence: 'high'
    };
  }

  if (hasJWT && !hasNextAuth && !hasNextAuthCSRF) {
    return {
      method: 'jwt',
      hasJWT,
      hasNextAuth: false,
      confidence: 'high'
    };
  }

  if (hasJWT && (hasNextAuth || hasNextAuthCSRF)) {
    // Usuario híbrido - priorizar NextAuth para usuarios de Google
    return {
      method: 'nextauth',
      hasJWT,
      hasNextAuth: hasNextAuth || hasNextAuthCSRF,
      confidence: 'medium'
    };
  }

  return {
    method: 'none',
    hasJWT,
    hasNextAuth: false,
    confidence: 'high'
  };
}

/**
 * Determina el endpoint de logout apropiado
 */
export function getLogoutEndpoint(user?: { isGoogleUser?: boolean } | null): string {
  if (user?.isGoogleUser) {
    return '/api/auth/hybrid-logout';
  }
  return '/api/auth/unified-logout';
}
