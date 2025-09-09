"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

type CheckAuthOptions = { silent?: boolean };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  checkAuth: (opts?: CheckAuthOptions) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
  setAuthUser: (u: User | null) => void; // 👈 nuevo
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async ({ silent = false }: CheckAuthOptions = {}) => {
    try {
      if (!silent) setLoading(true);
      
      if (process.env.NODE_ENV === 'development') {
        console.log("🔍 [AUTH DEBUG] Checking authentication...");
      }
      
      // Intentar con NextAuth.js primero
      try {
        const response = await fetch("/api/auth/me-nextauth");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            if (process.env.NODE_ENV === 'development') {
              console.log("✅ [AUTH DEBUG] NextAuth user found:", data.user);
            }
            setUser(data.user);
            return;
          }
        }
      } catch (nextAuthError) {
        console.log("NextAuth check failed:", nextAuthError);
      }
      
      // Si NextAuth falla, intentar con JWT
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            if (process.env.NODE_ENV === 'development') {
              console.log("✅ [AUTH DEBUG] JWT user found:", data.user);
            }
            setUser(data.user);
            return;
          }
        }
      } catch (jwtError) {
        console.log("JWT check failed:", jwtError);
      }
      
      // Si ambos fallan, usuario no autenticado
      if (process.env.NODE_ENV === 'development') {
        console.log("🔍 [AUTH DEBUG] No user found");
      }
      setUser(null);
      
    } catch (error) {
      console.log("Auth check error:", error);
      setUser(null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Limpiar el estado local primero
      setUser(null);
      setLoading(false);

      // Usar el endpoint de logout mejorado que limpia todas las cookies
      try {
        const response = await fetch("/api/auth/logout", { 
          method: "POST",
          credentials: "include" // Incluir cookies en la petición
        });
        
        if (!response.ok) {
          console.log("Logout endpoint failed, trying NextAuth");
        }
      } catch (fetchError) {
        console.log("Fetch logout failed:", fetchError);
      }

      // Intentar cerrar sesión con NextAuth como respaldo
      try {
        await signOut({ 
          redirect: false, // No redirigir automáticamente
          callbackUrl: "/login" 
        });
      } catch (nextAuthError) {
        console.log("NextAuth signOut failed:", nextAuthError);
      }

      // Limpiar cookies manualmente como último recurso
      document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "next-auth.csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "next-auth.callback-url=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Forzar recarga completa de la página para limpiar todo el estado
      window.location.replace("/login");
      
    } catch (error) {
      console.error("Error during logout:", error);
      // Aún así limpiar el estado y redirigir
      setUser(null);
      setLoading(false);
      
      // Limpiar cookies en caso de error
      document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "next-auth.csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "next-auth.callback-url=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      window.location.replace("/login");
    }
  };

  // 👇 setter directo para usar desde el login
  const setAuthUser = (u: User | null) => {
    setUser(u);
    setLoading(false);
  };

  useEffect(() => {
    checkAuth({ silent: false }); // carga inicial
  }, []);

  // No redirigir automáticamente - dejar que el middleware se encargue
  // El middleware ya maneja la redirección para usuarios no autenticados

  return (
    <AuthContext.Provider
      value={{ user, loading, checkAuth, logout, refetch: checkAuth, setAuthUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
