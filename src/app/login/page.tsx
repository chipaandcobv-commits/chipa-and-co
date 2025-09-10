"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  EmailIcon,
  EyeIcon,
  EyeOffIcon,
} from "../../components/icons/Icons";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import GoogleButton from "../../components/ui/GoogleButton";

export default function LoginPage() {
  const router = useRouter();
  const { checkAuth, setAuthUser, user } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        // 👉 poblar contexto al instante SIN encender loading global
        setAuthUser(data.user);

        // 👉 redirigir al destino correcto (evitá "/dashboard" si tu home de cliente es "/cliente")
        const target = data.user.role === "ADMIN" ? "/admin" : "/cliente";
        router.replace(target);

        // 👉 opcional: verificar en background sin tocar loading
        checkAuth({ silent: true });
      } else {
        setErrors(data.errors || { general: data.error });
      }
    } catch (error) {
      console.error("Login error:", error);
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
          <h2 className="text-3xl font-bold text-black">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-gray-600">
            Accede a tu cuenta de Chipa&Co
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

            <Input
              label=""
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
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password" // obligatorio para iOS
                  autoComplete="current-password" // ⚡ clave para iOS
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  className="pr-12 placeholder:text-gray-400 text-gray-700"
                  style={{ 
                    fontSize: '16px'
                  }}
                  onFocus={(e) => {
                    // Forzar re-render en Safari para inputs controlados
                    const val = e.target.value;
                    e.target.value = '';
                    e.target.value = val;
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  style={{ minHeight: '20px', minWidth: '20px' }}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="outline"
              className="w-full !bg-[#F15A25] !hover:bg-[#FF6B35] !text-white !border-[#F15A25] transition-colors duration-200"
              size="lg"
              isLoading={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-[#F15A25] hover:text-[#E55A1A] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#FFE4CC] text-gray-500">O continúa con</span>
              </div>
            </div>

            {/* Google Button */}
            <GoogleButton
              text="Continuar con Google"
              isLoading={isGoogleLoading}
              onLoadingChange={setIsGoogleLoading}
            />
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <Link
                href="/register"
                className="font-medium text-[#F15A25] hover:text-[#E55A1A] transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>

        {/* Información del Sistema - Responsiva */}
        <div className="mt-12 max-w-6xl mx-auto">
          {/* Benefits Section - Responsiva */}
          <section className="py-8 px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-[#F15A25] mb-4">
                Beneficios Exclusivos
              </h2>
              <p className="text-base md:text-lg text-gray-600">
                Descubre todo lo que puedes obtener
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
                <div className="text-3xl md:text-4xl mb-4">💎</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">
                  Puntos por Compra
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Gana puntos automáticamente con cada compra
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
                <div className="text-3xl md:text-4xl mb-4">🎯</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">
                  Premios Variados
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Descuentos, productos gratis y experiencias únicas
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow sm:col-span-2 lg:col-span-1">
                <div className="text-3xl md:text-4xl mb-4">📱</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">
                  Fácil de Usar
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Solo presenta tu DNI y disfruta, sin complicaciones
                </p>
              </div>
            </div>
          </section>

          {/* Footer - Responsivo */}
          <footer className="py-8 px-4">
            <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 md:p-8 text-center">
              <h3 className="text-lg md:text-xl font-semibold text-[#F15A25] mb-4">
                Chipa&Co - Sistema de Fidelización
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-6 leading-relaxed">
                La forma más fácil de ganar puntos y obtener premios increíbles.
              </p>

              <div className="pt-4 border-t border-gray-200 text-gray-500 text-xs md:text-sm">
                <p>© 2025 Chipa&Co. Todos los derechos reservados.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
