import { useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useDataCache } from "@/contexts/DataCacheContext";

/**
 * Hook para mantener los puntos del usuario actualizados en tiempo real
 * Se ejecuta automáticamente cada cierto tiempo para sincronizar con la base de datos
 */
export function useRealTimePoints() {
  const { user, refetch: refetchAuth } = useAuth();
  const { refetch: refetchDataCache } = useDataCache();

  const updatePoints = useCallback(async () => {
    if (!user) return;
    
    try {
      // Actualizar tanto el contexto de autenticación como el cache de datos
      await Promise.all([
        refetchAuth(),
        refetchDataCache('userProfile')
      ]);
    } catch (error) {
      console.error("Error actualizando puntos:", error);
    }
  }, [user, refetchAuth, refetchDataCache]);

  useEffect(() => {
    if (!user) return;

    // Actualizar puntos cada 30 segundos si el usuario está activo
    const interval = setInterval(updatePoints, 30000);

    // También actualizar cuando la ventana vuelve a estar en foco
    const handleFocus = () => {
      updatePoints();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, updatePoints]);

  return {
    updatePoints,
  };
}
