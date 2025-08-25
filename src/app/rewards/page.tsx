"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";

export default function RewardsRedirectPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/cliente/rewards";
      }
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo a premios...</p>
      </div>
    </div>
  );
}
