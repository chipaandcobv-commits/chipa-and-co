"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import Button from "./ui/Button";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export default function LogoutButton({ 
  className = "", 
  children = "Cerrar Sesión",
  variant = "outline",
  size = "md"
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Mostrar mensaje de confirmación
      const confirmed = window.confirm("¿Estás seguro de que quieres cerrar sesión?");
      if (!confirmed) {
        setIsLoggingOut(false);
        return;
      }

      // Ejecutar logout
      await logout();
      
      // El logout ya maneja la redirección, pero por si acaso
      setTimeout(() => {
        window.location.replace("/login");
      }, 1000);
      
    } catch (error) {
      console.error("Error during logout:", error);
      setIsLoggingOut(false);
      
      // Forzar redirección en caso de error
      window.location.replace("/login");
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      size={size}
      className={className}
      isLoading={isLoggingOut}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? "Cerrando sesión..." : children}
    </Button>
  );
}
