"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface AdminRedirectProps {
  children: React.ReactNode;
}

/**
 * Componente que redirige a los administradores al panel admin
 * si intentan acceder a rutas de usuario
 */
export default function AdminRedirect({ children }: AdminRedirectProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir si el usuario es admin y no está cargando
    if (!loading && user && user.role === "ADMIN") {
      // Si es admin, redirigir al panel admin
      router.replace("/admin");
    }
  }, [user, loading, router]);

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-orange-600">Cargando...</div>
      </div>
    );
  }

  // Si es admin, no mostrar contenido (ya está siendo redirigido)
  if (user && user.role === "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-orange-600">Redirigiendo al panel de administración...</div>
      </div>
    );
  }

  // Si es usuario normal, mostrar contenido
  return <>{children}</>;
}
