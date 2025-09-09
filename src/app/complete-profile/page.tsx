"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut, signIn } from "next-auth/react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { UserIcon } from "../../components/icons/Icons";
import Image from "next/image";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    dni: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirección si no está autenticado o no necesita completar perfil
  useEffect(() => {
    if (status === "loading") return; // Aún cargando

    if (!session) {
      router.replace("/login");
      return;
    }

    // Verificar si el usuario existe en la base de datos
    const checkUserExists = async () => {
      try {
        const response = await fetch("/api/auth/clear-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (data.success && data.shouldClearSession) {
          // El usuario no existe en la base de datos, limpiar sesión y redirigir
          await signOut({ callbackUrl: "/login" });
          return;
        }

        // Si el usuario no necesita completar perfil, redirigir
        if (session.user && !session.user.needsProfileCompletion) {
          // Generar token JWT para el sistema existente
          try {
            const tokenResponse = await fetch("/api/auth/google-complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });

            const tokenData = await tokenResponse.json();

            if (tokenData.success) {
              // Guardar el token JWT en las cookies
              document.cookie = `auth-token=${tokenData.token}; path=/; max-age=86400; secure; samesite=strict`;
              
              // Redirigir según el rol
              const target = session.user.role === "ADMIN" ? "/admin" : "/cliente";
              window.location.href = target;
              return;
            }
          } catch (error) {
            console.error("Token generation error:", error);
          }
          
          // Fallback: redirigir sin token
          const target = session.user.role === "ADMIN" ? "/admin" : "/cliente";
          router.replace(target);
          return;
        }
      } catch (error) {
        console.error("Error checking user existence:", error);
        // En caso de error, continuar con el flujo normal
      }
    };

    checkUserExists();
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validaciones del frontend
    const newErrors: Record<string, string> = {};

    if (!formData.dni.trim()) {
      newErrors.dni = "El DNI es requerido";
    } else if (!/^\d{7,8}$/.test(formData.dni.trim())) {
      newErrors.dni = "El DNI debe tener entre 7 y 8 dígitos";
    }

    if (!formData.password.trim()) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Debes confirmar la contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Generar token JWT para el sistema existente
        try {
          const tokenResponse = await fetch("/api/auth/google-complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          const tokenData = await tokenResponse.json();

          if (tokenData.success) {
            // Guardar el token JWT en las cookies
            document.cookie = `auth-token=${tokenData.token}; path=/; max-age=86400; secure; samesite=strict`;
            
            // Recargar la página para actualizar la sesión
            window.location.href = data.user.role === "ADMIN" ? "/admin" : "/cliente";
          } else {
            setErrors({ general: "Error al generar token de acceso" });
          }
        } catch (tokenError) {
          console.error("Token generation error:", tokenError);
          setErrors({ general: "Error al generar token de acceso" });
        }
      } else {
        setErrors(data.errors || { general: data.error });
      }
    } catch (error) {
      console.error("Profile completion error:", error);
      setErrors({ general: "Error de conexión. Intenta nuevamente." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Limpiar error del campo cuando el usuario comience a escribir
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

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

  if (!session) {
    return null; // Se redirigirá automáticamente
  }

  return (
    <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Image
              src="/Chipá&Co.png"
              alt="Chipa&Co Logo"
              width={180}
              height={180}
              className="object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-black">Completar Perfil</h2>
          <p className="mt-2 text-sm text-gray-600">
            ¡Hola {session.user?.name}! Necesitamos algunos datos adicionales para completar tu registro.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="relative rounded-2xl bg-[#FFE4CC] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 space-y-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {errors.general}
              </div>
            )}

            <div className="text-center mb-6">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full mx-auto mb-2"
                />
              )}
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {session.user?.email}
              </p>
            </div>

            <Input
              label="DNI"
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              placeholder="Tu número de DNI"
              icon={<UserIcon />}
              error={errors.dni}
              required
              className="placeholder:text-gray-400 text-gray-700"
              style={{ 
                fontSize: '16px'
              }}
            />

            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Crea una contraseña segura"
              error={errors.password}
              required
              className="placeholder:text-gray-400 text-gray-700"
              style={{ 
                fontSize: '16px'
              }}
            />

            <Input
              label="Confirmar Contraseña"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirma tu contraseña"
              error={errors.confirmPassword}
              required
              className="placeholder:text-gray-400 text-gray-700"
              style={{ 
                fontSize: '16px'
              }}
            />

            <Button
              type="submit"
              variant="outline"
              className="w-full !bg-[#F15A25] !hover:bg-[#FF6B35] !text-white !border-[#F15A25] transition-colors duration-200"
              size="lg"
              isLoading={isLoading}
            >
              {isLoading ? "Completando perfil..." : "Completar Registro"}
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Al completar tu perfil, podrás acceder a todos los beneficios del programa de fidelización.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
