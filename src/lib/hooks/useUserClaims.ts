import { useState, useEffect } from "react";

interface Reward {
  id: string;
  name: string;
  description: string | null;
  pointsCost: number;
}

interface Claim {
  id: string;
  rewardId: string;
  userId: string;
  pointsSpent: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  reward: Reward;
}

interface ClaimsState {
  claims: Claim[];
  loading: boolean;
  error: string | null;
}

export function useUserClaims() {
  const [claimsState, setClaimsState] = useState<ClaimsState>({
    claims: [],
    loading: true,
    error: null,
  });

  const fetchClaims = async () => {
    try {
      setClaimsState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch("/api/user/claims");
      const data = await response.json();

      if (data.success) {
        setClaimsState({
          claims: data.claims,
          loading: false,
          error: null,
        });
      } else {
        setClaimsState({
          claims: [],
          loading: false,
          error: data.error || "Error al obtener premios canjeados",
        });
      }
    } catch (error) {
      setClaimsState({
        claims: [],
        loading: false,
        error: "Error de conexión",
      });
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  return {
    claims: claimsState.claims,
    loading: claimsState.loading,
    error: claimsState.error,
    refetch: fetchClaims,
  };
}
