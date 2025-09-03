import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  dni: string;
  puntos: number;
  puntosHistoricos: number;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const fetchUser = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (data.success) {
        // Asegurar que el usuario tenga todas las propiedades necesarias
        const userWithDefaults = {
          ...data.user,
          puntos: data.user.puntos ?? 0,
          puntosHistoricos: data.user.puntosHistoricos ?? 0,
        };
        
        setAuthState({
          user: userWithDefaults,
          loading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: data.error || "Error al obtener datos del usuario",
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: "Error de conexión",
      });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    logout,
    refetch: fetchUser,
  };
}
