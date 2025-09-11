import { useState } from "react";
import { useDataCache } from "@/contexts/DataCacheContext";

interface UpdateProfileParams {
  profileData: {
    name: string;
    email: string;
  };
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const { refetch } = useDataCache();

  const updateProfile = async ({ profileData, onSuccess, onError }: UpdateProfileParams) => {
    setLoading(true);
    
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.success) {
        // Esperar un tiempo prudencial para que se reflejen los cambios en la BD
        setTimeout(async () => {
          await refetch('userProfile'); // Actualizar perfil en caché
        }, 2000); // 2 segundos de espera
        
        onSuccess?.(data);
      } else {
        onError?.(data.error || "Error al actualizar perfil");
      }
    } catch (error) {
      onError?.("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProfile,
    loading,
  };
}
