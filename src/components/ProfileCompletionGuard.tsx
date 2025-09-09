"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
}

export default function ProfileCompletionGuard({ children }: ProfileCompletionGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return; // Aún cargando

    // No aplicar el guard si ya estamos en la página de completar perfil
    if (pathname === "/complete-profile") {
      return;
    }

    // Si el usuario está autenticado y necesita completar perfil
    if (session?.user?.needsProfileCompletion) {
      console.log("🛡️ ProfileCompletionGuard: Redirecting to complete profile");
      router.replace("/complete-profile");
      return;
    }

    // Si el usuario no está autenticado, el middleware se encargará de redirigir
  }, [session, status, router, pathname]);

  // Si está cargando, mostrar loading
  if (status === "loading") {
    return (
      <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A25] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si necesita completar perfil y NO estamos en la página de completar perfil, mostrar loading
  if (session?.user?.needsProfileCompletion && pathname !== "/complete-profile") {
    return (
      <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A25] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo a completar perfil...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
