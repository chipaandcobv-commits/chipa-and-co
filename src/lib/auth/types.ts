export interface User {
  id: string;
  name: string;
  email: string;
  dni: string;
  puntos: number;
  puntosHistoricos: number;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
  isGoogleUser?: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isLoggingOut: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: (options?: { silent?: boolean }) => Promise<void>;
  refetch: () => Promise<void>;
  setAuthUser: (user: User | null) => void;
}

export type AuthMethod = 'jwt' | 'nextauth' | 'none';

export interface AuthResult {
  success: boolean;
  user?: User;
  method?: AuthMethod;
  error?: string;
}
