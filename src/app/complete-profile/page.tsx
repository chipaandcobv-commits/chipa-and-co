"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { UserIcon, EyeIcon, EyeOffIcon } from "../../components/icons/Icons";
import Image from "next/image";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [formData, setFormData] = useState({
    dni: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirección si no está autenticado o no necesita completar perfil
  useEffect(() => {
    if (status === "loading") return; // Aún cargando

    if (!session) {
      router.replace("/login");
      return;
    }

    // Verificar si el usuario ya completó su perfil
    if (session.user && !session.user.needsProfileCompletion) {
      const target = session.user.role === "ADMIN" ? "/admin" : "/cliente";
      router.replace(target);
    }
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
        console.log("✅ Perfil completado con éxito:", data.user);

        // 1. Llama a la función `update` para refrescar la sesión del lado del cliente
        await update({
          ...session, // Mantiene los datos de sesión existentes
          user: {
            ...session?.user, // Mantiene los datos del usuario existentes
            needsProfileCompletion: false, // Actualiza directamente el campo relevante
          },
        });

        console.log("✅ Sesión de NextAuth actualizada vía `update()`");

        // 2. Redirige solo después de que la sesión se haya actualizado
        const target = session?.user?.role === "ADMIN" ? "/admin" : "/cliente";
        router.replace(target);

      } else {
        console.error("❌ El perfil no se pudo completar:", data);
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
              src="/chipa-logo.png"
              alt="Chipa&Co Logo"
              width={180}
              height={180}
              className="object-contain"
              priority
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <h2 className="text-3xl font-bold text-black">Completar Perfil</h2>
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
              error={errors.dni}
              required
              className="placeholder:text-gray-400 text-gray-700"
              style={{ 
                fontSize: '16px'
              }}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="password"
                  id="password"
                  autoComplete="new-password"
                  placeholder="Crea una contraseña segura"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-14 text-gray-900 bg-[#FFE4CC] border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 min-h-[48px] h-[48px] text-base placeholder:text-gray-400"
                  style={{ 
                    fontSize: '16px',
                    minHeight: '48px',
                    WebkitTextSecurity: showPassword ? 'none' : 'disc'
                  } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  style={{ minHeight: '20px', minWidth: '20px' }}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="confirmPassword"
                  id="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Confirma tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-14 text-gray-900 bg-[#FFE4CC] border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 min-h-[48px] h-[48px] text-base placeholder:text-gray-400"
                  style={{ 
                    fontSize: '16px',
                    minHeight: '48px',
                    WebkitTextSecurity: showConfirmPassword ? 'none' : 'disc'
                  } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  style={{ minHeight: '20px', minWidth: '20px' }}
                >
                  {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

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
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Al completar tu perfil, podrás acceder a todos los beneficios de la aplicación.
            </p>
            <div className="pt-4 border-t border-gray-300">
              <p className="text-sm text-gray-600 mb-3">
                ¿Quieres usar otro email para registrarte?
              </p>
              <Link
                href="/login"
                className="inline-flex items-center text-sm font-medium text-[#F15A25] hover:text-[#E55A1A] transition-colors"
              >
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
