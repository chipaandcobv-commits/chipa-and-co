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
      
      // Primero intentar con NextAuth.js
      let response = await fetch("/api/auth/me-nextauth");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          return;
        }
      }
      
      // Si NextAuth falla, intentar con el sistema JWT existente
      response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.success ? data.user : null);
      } else {
        setUser(null);
      }
    } catch {
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
    } catch (error) {
      console.error("Error during logout:", error);
      // Aún así limpiar el estado
      setUser(null);
      setLoading(false);
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
