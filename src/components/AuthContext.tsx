"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
      const response = await fetch("/api/auth/me");
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
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
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
