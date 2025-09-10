"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function AutoRedirect() {
  const { user, loading, isLoggingOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // No redirigir si estamos en proceso de logout
    if (isLoggingOut) {
      if (process.env.NODE_ENV === 'development') {
        console.log("🔄 [AUTO REDIRECT] Skipping redirect - logout in progress");
      }
      return;
    }

    // No redirigir si viene de logout o si está en una ruta de autenticación
    const fromLogout = searchParams.get("from") === "logout";
    const isAuthRoute = window.location.pathname === "/login" || 
                       window.location.pathname === "/register";

    if (process.env.NODE_ENV === 'development') {
      console.log("🔍 [AUTO REDIRECT] Checking redirect:", { 
        fromLogout, 
        isAuthRoute, 
        hasUser: !!user, 
        loading,
        isLoggingOut
      });
    }

    // No redirigir si viene de logout o está en ruta de auth
    if (fromLogout || isAuthRoute) {
      if (process.env.NODE_ENV === 'development') {
        console.log("🔄 [AUTO REDIRECT] Skipping redirect due to logout or auth route");
      }
      return;
    }

    if (!loading && user) {
      if (user.role === "ADMIN") {
        router.replace("/admin");
      } else if (user.role === "USER") {
        router.replace("/cliente");
      }
    }
  }, [user, loading, router, searchParams, isLoggingOut]);

  // No renderizar nada mientras se redirige
  return null;
}
