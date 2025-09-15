"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  EmailIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
} from "../../components/icons/Icons";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import GoogleButton from "../../components/ui/GoogleButton";

export default function RegisterPage() {
  const router = useRouter();
  const { checkAuth, user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dni: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirección automática si ya está autenticado
  useEffect(() => {
    if (user) {
      const target = user.role === "ADMIN" ? "/admin" : "/cliente";
      router.replace(target);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        await checkAuth(); // Actualizar el contexto de autenticación
        // Redirigir según el rol del usuario (los usuarios nuevos siempre son USER por defecto)
        if (data.user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/cliente");
        }
      } else {
        setErrors(data.errors || { general: data.error });
      }
    } catch (error) {
      console.error("Registration error:", error);
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

  return (
    <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist flex items-center justify-center p-4">
      <div className="max-w-md lg:max-w-7xl w-full space-y-8">
        {/* Header */}
        <div className="text-center lg:max-w-md lg:mx-auto">
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
          <h2 className="text-3xl font-bold text-black">Crear Cuenta</h2>
          <p className="mt-2 text-sm text-gray-600">
            Únete al programa de fidelización de Chipa&Co
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 lg:max-w-md lg:mx-auto" onSubmit={handleSubmit}>
          <div className="relative rounded-2xl bg-[#FFE4CC] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 space-y-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {errors.general}
              </div>
            )}

            {/* Google Button - Primera opción */}
            <GoogleButton
              text="Registrarse con Google"
              isLoading={isGoogleLoading}
              onLoadingChange={setIsGoogleLoading}
            />

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#FFE4CC] text-gray-500">O regístrate con email</span>
              </div>
            </div>

            <Input
              label="Nombre completo"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              error={errors.name}
              required
              className="placeholder:text-gray-400 text-gray-700"
              style={{ 
                fontSize: '16px'
              }}
            />

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

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              error={errors.email}
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
                  placeholder="Mínimo 8 caracteres"
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
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="confirmPassword"
                  id="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Repite tu contraseña"
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
              {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>


            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#FFE4CC] text-gray-500">O regístrate con</span>
              </div>
            </div>

            {/* Google Button */}
            <GoogleButton
              text="Registrarse con Google"
              isLoading={isGoogleLoading}
              onLoadingChange={setIsGoogleLoading}
            />
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="font-medium text-[#F15A25] hover:text-[#E55A1A] transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </form>

        {/* Información del Sistema - Responsiva */}
        <div className="mt-12 w-full">
          {/* Benefits Section - Responsiva */}
          <section className="py-8 px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#F15A25] mb-4">
                Únete a Chipa&Co
              </h2>
              <p className="text-base md:text-lg text-gray-600">
                Comienza a ganar puntos desde tu primera compra
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 md:p-8 text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow aspect-[4/3] lg:aspect-[2/1] flex flex-col justify-center">
                <div className="text-4xl md:text-5xl mb-4">🚀</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 px-2">
                  Registro Rápido
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed px-2">
                  Solo necesitas tu DNI y email para comenzar
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 md:p-8 text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow aspect-[4/3] lg:aspect-[2/1] flex flex-col justify-center">
                <div className="text-4xl md:text-5xl mb-4">🎁</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 px-2">
                  Premios Inmediatos
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed px-2">
                  Accede a descuentos y premios desde el primer día
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 md:p-8 text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow sm:col-span-2 lg:col-span-1 aspect-[4/3] lg:aspect-[2/1] flex flex-col justify-center">
                <div className="text-4xl md:text-5xl mb-4">💎</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 px-2">
                  Puntos Acumulables
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed px-2">
                  Tus puntos nunca expiran y se acumulan automáticamente
                </p>
              </div>
            </div>
          </section>

          {/* Footer - Responsivo */}
          <footer className="py-8 px-4">
            <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 md:p-8 text-center">
              <h3 className="text-lg md:text-xl font-semibold text-[#F15A25] mb-4">
                Chipa&Co
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-6 leading-relaxed">
                La forma más fácil de ganar puntos y obtener premios increíbles.
              </p>

              <div className="pt-4 border-t border-gray-200 text-gray-500 text-xs md:text-sm">
                <p>© 2025 Chipa&Co</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
