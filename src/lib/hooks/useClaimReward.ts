import { useState } from "react";

interface ClaimRewardParams {
  rewardId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useClaimReward() {
  const [loading, setLoading] = useState(false);

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
