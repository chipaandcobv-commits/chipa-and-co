import { useState } from "react";

interface ChangePasswordParams {
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useChangePassword() {
  const [loading, setLoading] = useState(false);

  const changePassword = async ({ passwordData, onSuccess, onError }: ChangePasswordParams) => {
    setLoading(true);
    
    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess?.(data);
      } else {
        onError?.(data.error || "Error al cambiar contraseña");
      }
    } catch (error) {
      onError?.("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return {
    changePassword,
    loading,
  };
}
