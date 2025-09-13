import { useState } from "react";
import { useDataCache } from "@/contexts/DataCacheContext";
import { useAuth } from "@/lib/auth";

interface ClaimRewardParams {
  rewardId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useClaimReward() {
  const [loading, setLoading] = useState(false);
  const { refetch } = useDataCache();
  const { user, setAuthUser, refetch: refetchAuth } = useAuth();

  const claimReward = async ({ rewardId, onSuccess, onError }: ClaimRewardParams) => {
    setLoading(true);
    
    try {
      const response = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rewardId }),
      });

      const data = await response.json();

      if (data.success) {
        // Actualizar inmediatamente los puntos en el contexto de autenticación
        if (data.newTotalPoints !== undefined && user) {
          setAuthUser({
            ...user,
            puntos: data.newTotalPoints
          });
        }
        
        // Actualizar los datos del cache inmediatamente
        await Promise.all([
          refetch('userProfile'), // Actualizar puntos del usuario
          refetch('userClaims'),  // Actualizar premios canjeados
        ]);
        
        // También actualizar el contexto de autenticación desde la base de datos
        setTimeout(async () => {
          await refetchAuth();
        }, 1000); // 1 segundo de espera para asegurar consistencia
        
        onSuccess?.(data);
      } else {
        onError?.(data.error || "Error al canjear premio");
      }
    } catch (error) {
      onError?.("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return {
    claimReward,
    loading,
  };
}
