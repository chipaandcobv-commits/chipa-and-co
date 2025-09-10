/**
 * Punto de entrada unificado para el sistema de autenticación
 */

export { AuthProvider, useAuth } from './context';
export { AuthClient } from './client';
export { detectAuthMethod, getLogoutEndpoint } from './detector';
export type { User, AuthState, AuthContextType, AuthMethod, AuthResult } from './types';
