"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

export default function AutoRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "ADMIN") {
        router.replace("/admin");
      } else if (user.role === "USER") {
        router.replace("/cliente");
      }
    }
  }, [user, loading, router]);

  // No renderizar nada mientras se redirige
  return null;
}
