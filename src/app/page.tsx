"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import Button from "../components/ui/Button";
import { DashboardIcon } from "../components/icons/Icons";
import AutoRedirect from "../components/AutoRedirect";

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <>
      <AutoRedirect />
      <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
        {/* Hero Section - Optimizado para móvil */}
        <section className="pt-6 pb-8 px-4 sm:pt-8 sm:pb-12 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#F15A25] mb-4 sm:mb-6 leading-tight">
              Gana puntos con cada compra
            </h1>
            <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 leading-relaxed">
              Presenta tu DNI al comprar, acumula puntos automáticamente y canjea increíbles premios. ¡Es fácil, rápido y completamente gratuito!
            </p>

            {!user ? (
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-3 bg-[#F15A25] hover:bg-[#E55A1A] shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Comenzar Ahora
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-3 border-[#F15A25] text-[#F15A25] hover:bg-[#FCE6D5] shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Ya tengo cuenta
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>
        </section>

        {/* Features Section - Optimizado para móvil */}
        <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F15A25] mb-3 sm:mb-4">
                ¿Cómo funciona?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 px-2">
                Simple, rápido y completamente automático
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-4 sm:p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#FCE6D5] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl">🛒</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                  1. Compra
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Realiza compras en cualquiera de nuestros establecimientos participantes.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-4 sm:p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#FCE6D5] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl">💳</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                  2. Presenta tu DNI
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Al momento de la compra, presenta tu DNI para que se te asignen los puntos automáticamente.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-4 sm:p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#FCE6D5] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl">🎁</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                  3. Canjea
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Usa tus puntos para obtener descuentos, productos gratuitos y premios exclusivos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section - Optimizado para móvil */}
        <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F15A25] mb-3 sm:mb-4">
                Beneficios Exclusivos
              </h2>
              <p className="text-base sm:text-lg text-gray-600 px-2">
                Descubre todo lo que puedes obtener
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-4 sm:p-6 text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">💎</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  Puntos por Compra
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Gana puntos automáticamente con cada compra
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-4 sm:p-6 text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🎯</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  Premios Variados
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Descuentos, productos gratis y experiencias únicas
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-4 sm:p-6 text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow sm:col-span-2 lg:col-span-1">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📱</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  Fácil de Usar
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Solo presenta tu DNI y disfruta, sin complicaciones
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Optimizado para móvil */}
        <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F15A25] rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-6 sm:p-8 text-center text-white">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">¿Listo para comenzar?</h2>
              <p className="text-base sm:text-lg mb-6 sm:mb-8 text-orange-100 px-2 leading-relaxed">
                Únete a miles de usuarios que ya están ganando puntos y disfrutando de increíbles premios.
              </p>

              {!user ? (
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto bg-white text-[#F15A25] hover:bg-orange-50 border-white text-base sm:text-lg px-6 sm:px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Crear Cuenta Gratis
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto bg-white text-[#F15A25] hover:bg-orange-50 border-white text-base sm:text-lg px-6 sm:px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Footer - Optimizado para móvil */}
        <footer className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 sm:p-8 text-center">
              <h3 className="text-base sm:text-lg font-semibold text-[#F15A25] mb-3 sm:mb-4">
                Chipa&Co - Sistema de Fidelización
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2 leading-relaxed">
                La forma más fácil de ganar puntos y obtener premios increíbles.
              </p>

              {user && (
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm mb-4 sm:mb-6">
                  <Link
                    href={user.role === "ADMIN" ? "/admin" : "/cliente"}
                    className="text-[#F15A25] hover:text-[#E55A1A] font-medium px-2 py-1 rounded-lg hover:bg-[#FCE6D5] transition-colors"
                  >
                    Inicio
                  </Link>
                  <Link 
                    href={user.role === "ADMIN" ? "/admin/rewards" : "/cliente/rewards"} 
                    className="text-[#F15A25] hover:text-[#E55A1A] font-medium px-2 py-1 rounded-lg hover:bg-[#FCE6D5] transition-colors"
                  >
                    Premios
                  </Link>
                  <Link 
                    href={user.role === "ADMIN" ? "/admin/ranking" : "/ranking"} 
                    className="text-[#F15A25] hover:text-[#E55A1A] font-medium px-2 py-1 rounded-lg hover:bg-[#FCE6D5] transition-colors"
                  >
                    Ranking
                  </Link>
                  <Link 
                    href={user.role === "ADMIN" ? "/admin/orders" : "/cliente/rewards"} 
                    className="text-[#F15A25] hover:text-[#E55A1A] font-medium px-2 py-1 rounded-lg hover:bg-[#FCE6D5] transition-colors"
                  >
                    Historial
                  </Link>
                </div>
              )}

              <div className="pt-4 sm:pt-6 border-t border-gray-200 text-gray-500 text-xs sm:text-sm">
                <p>
                  &copy; 2025 Chipa&Co. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
