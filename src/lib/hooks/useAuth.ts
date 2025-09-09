import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

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
      
      // Intentar primero con NextAuth, luego con JWT personalizado
      let response = await fetch("/api/auth/me-nextauth");
      let data = await response.json();

      // Si NextAuth falla, intentar con JWT personalizado
      if (!data.success) {
        response = await fetch("/api/auth/me");
        data = await response.json();
      }

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
      // Limpiar el estado local primero
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });

      // Intentar cerrar sesión con NextAuth primero
      try {
        await signOut({ 
          redirect: false, // No redirigir automáticamente
          callbackUrl: "/login" 
        });
      } catch (nextAuthError) {
        console.log("NextAuth signOut failed, trying custom logout:", nextAuthError);
        
        // Si NextAuth falla, intentar con JWT personalizado
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch (jwtError) {
          console.log("JWT logout also failed:", jwtError);
        }
      }

      // Redirigir manualmente a la página de login
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Aún así limpiar el estado y redirigir
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
      window.location.href = "/login";
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
