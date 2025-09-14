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
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

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
          <h2 className="text-3xl font-bold text-black">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-gray-600">
            Accede a tu cuenta de Chipa&Co
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
                    fontSize: '16px',
                    minHeight: '48px'
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
              <button
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-sm text-[#F15A25] hover:text-[#E55A1A] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
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
        <div className="mt-12 w-full">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 md:p-8 text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow aspect-[4/3] lg:aspect-[2/1] flex flex-col justify-center">
                <div className="text-4xl md:text-5xl mb-4">💎</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 px-2">
                  Puntos por Compra
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed px-2">
                  Gana puntos automáticamente con cada compra
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 md:p-8 text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow aspect-[4/3] lg:aspect-[2/1] flex flex-col justify-center">
                <div className="text-4xl md:text-5xl mb-4">🎯</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 px-2">
                  Premios Variados
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed px-2">
                  Descuentos, productos gratis y experiencias únicas
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 md:p-8 text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow sm:col-span-2 lg:col-span-1 aspect-[4/3] lg:aspect-[2/1] flex flex-col justify-center">
                <div className="text-4xl md:text-5xl mb-4">📱</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 px-2">
                  Fácil de Usar
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed px-2">
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
                <p>© 2025 Chipa&Co</p>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Modal para información de recuperación de contraseña */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#F4E7DB] rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-[#F15A25] mb-2">
                🔑 Recuperar Contraseña
              </h3>
              <p className="text-sm text-gray-600">
                Para restablecer tu contraseña, necesitas asistir al local
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#FCE6D5] rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">📍</div>
                  <div>
                    <h4 className="font-medium text-[#F15A25] mb-1">Asistir al Local</h4>
                    <p className="text-sm text-gray-700">
                      Visita nuestro local con tu DNI físico para que nuestro personal pueda restablecer tu contraseña de forma segura.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#FCE6D5] rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🆔</div>
                  <div>
                    <h4 className="font-medium text-[#F15A25] mb-1">Documento Requerido</h4>
                    <p className="text-sm text-gray-700">
                      Es necesario presentar tu DNI físico para verificar tu identidad y proteger tu cuenta.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#FCE6D5] rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">⏰</div>
                  <div>
                    <h4 className="font-medium text-[#F15A25] mb-1">Horarios de Atención</h4>
                    <p className="text-sm text-gray-700">
                      Puedes asistir durante nuestro horario de atención al cliente para recibir asistencia inmediata.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => setShowForgotPasswordModal(false)}
                className="bg-[#F15A25] hover:bg-[#E55A1A] text-white px-6 py-2 rounded-lg transition-colors"
              >
                ✅ Entendido
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
