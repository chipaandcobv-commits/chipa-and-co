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
              // Usuario necesita completar perfil - redirigir directamente sin verificar sesión
              console.log("🔄 [AUTH-CALLBACK] User needs profile completion, redirecting to complete-profile");
              router.push("/complete-profile");
            } else {
              // Usuario completo, redirigir según rol
              const target = user.role === "ADMIN" ? "/admin" : "/cliente";
              console.log("✅ [AUTH-CALLBACK] User complete, redirecting to:", target);
              router.push(target);
            }
          } else {
            // Usuario no encontrado en BD pero tiene sesión de Google - crear usuario
            console.log("🆕 [AUTH-CALLBACK] User not found in DB but has Google session, creating user");
            
            // Crear usuario automáticamente
            const createResponse = await fetch("/api/auth/google-complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });

            if (createResponse.ok) {
              const createData = await createResponse.json();
              if (createData.success) {
                // Usuario creado exitosamente, redirigir a completar perfil
                console.log("✅ [AUTH-CALLBACK] User created successfully, redirecting to complete-profile");
                router.push("/complete-profile");
              } else {
                console.error("❌ [AUTH-CALLBACK] Error creating user:", createData.error);
                router.push("/login");
              }
            } else {
              console.error("❌ [AUTH-CALLBACK] Error creating user");
              router.push("/login");
            }
          }
        } catch (error) {
          console.error("❌ [AUTH-CALLBACK] Error in auth callback:", error);
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
