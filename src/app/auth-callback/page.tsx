"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export default function AuthCallback() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (status === "loading") return; // Aún cargando

      if (status === "unauthenticated") {
        // No autenticado, redirigir a login
        router.push("/login");
        return;
      }

      if (session?.user?.email) {
        try {
          // Verificar el estado del usuario en la base de datos
          const response = await fetch("/api/auth/me-nextauth");
          const userData = await response.json();

          if (userData.success && userData.user) {
            const user = userData.user;

            if (user.needsProfileCompletion) {
              // Usuario necesita completar perfil
              router.push("/complete-profile");
            } else {
              // Usuario completo, redirigir según rol
              const target = user.role === "ADMIN" ? "/admin" : "/cliente";
              router.push(target);
            }
          } else {
            // Error al obtener datos del usuario
            console.error("Error getting user data:", userData.error);
            router.push("/login");
          }
        } catch (error) {
          console.error("Error in auth callback:", error);
          router.push("/login");
        }
      }
    };

    handleAuthCallback();
  }, [session, status, router]);

  // Mostrar loading mientras se procesa
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-orange-700 font-medium">Procesando autenticación...</p>
      </div>
    </div>
  );
}
