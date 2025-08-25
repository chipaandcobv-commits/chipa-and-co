import { useState, useEffect } from "react";

interface Reward {
  id: string;
  name: string;
  description: string | null;
  pointsCost: number;
  imageUrl: string | null;
  stock: number | null;
  isActive: boolean;
  _count: {
    claims: number;
  };
}

interface RewardsState {
  rewards: Reward[];
  loading: boolean;
  error: string | null;
}

export function useRewards() {
  const [rewardsState, setRewardsState] = useState<RewardsState>({
    rewards: [],
    loading: true,
    error: null,
  });

  const fetchRewards = async () => {
    try {
      setRewardsState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch("/api/rewards");
      const data = await response.json();

      if (data.success) {
        setRewardsState({
          rewards: data.rewards,
          loading: false,
          error: null,
        });
      } else {
        setRewardsState({
          rewards: [],
          loading: false,
          error: data.error || "Error al obtener premios",
        });
      }
    } catch (error) {
      setRewardsState({
        rewards: [],
        loading: false,
        error: "Error de conexión",
      });
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  return {
    rewards: rewardsState.rewards,
    loading: rewardsState.loading,
    error: rewardsState.error,
    refetch: fetchRewards,
  };
}
