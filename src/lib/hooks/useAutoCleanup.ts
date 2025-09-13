import { useEffect } from "react";

/**
 * Hook para ejecutar limpieza automática de premios vencidos
 * Se ejecuta automáticamente cuando se monta el componente
 */
export function useAutoCleanup() {
  useEffect(() => {
    const cleanupExpiredRewards = async () => {
      try {
        const response = await fetch("/api/cron/cleanup", {
          method: "GET",
        });
        const data = await response.json();
        
        if (data.success) {
          console.log("🧹 Limpieza automática ejecutada:", {
            expiredCount: data.expiredCount,
            deletedCount: data.deletedCount,
          });
        }
      } catch (error) {
        console.error("❌ Error en limpieza automática:", error);
      }
    };

    // Ejecutar limpieza automática al montar el componente
    cleanupExpiredRewards();
  }, []);
}
