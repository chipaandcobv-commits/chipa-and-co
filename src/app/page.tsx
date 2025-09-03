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
        {/* Hero Section */}
        <section className="pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#F26D1F] mb-6">
              Gana puntos con cada compra
            </h1>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Presenta tu DNI al comprar, acumula puntos automáticamente y canjea increíbles premios. ¡Es fácil, rápido y completamente gratuito!
            </p>

            {!user ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8 py-3 bg-[#F26D1F] hover:bg-[#E55A1A]">
                    Comenzar Ahora
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-3 border-[#F26D1F] text-[#F26D1F] hover:bg-[#FCE6D5]"
                  >
                    Ya tengo cuenta
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>
        </section>

      {/* Features Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#F26D1F] mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-lg text-gray-600">
              Simple, rápido y completamente automático
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="w-16 h-16 bg-[#FCE6D5] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                1. Compra
              </h3>
              <p className="text-sm text-gray-600">
                Realiza compras en cualquiera de nuestros establecimientos
                participantes.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="w-16 h-16 bg-[#FCE6D5] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                2. Presenta tu DNI
              </h3>
              <p className="text-sm text-gray-600">
                Al momento de la compra, presenta tu DNI para que se te asignen los puntos automáticamente.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="w-16 h-16 bg-[#FCE6D5] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🎁</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                3. Canjea
              </h3>
              <p className="text-sm text-gray-600">
                Usa tus puntos para obtener descuentos, productos gratuitos y
                premios exclusivos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#F26D1F] mb-4">
              Beneficios Exclusivos
            </h2>
            <p className="text-lg text-gray-600">
              Descubre todo lo que puedes obtener
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="text-3xl mb-3">💎</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Puntos por Compra
              </h3>
              <p className="text-sm text-gray-600">
                Gana puntos automáticamente con cada compra
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Premios Variados
              </h3>
              <p className="text-sm text-gray-600">
                Descuentos, productos gratis y experiencias únicas
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 text-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Fácil de Usar
              </h3>
              <p className="text-sm text-gray-600">
                Solo presenta tu DNI y disfruta, sin complicaciones
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#F26D1F] rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
            <p className="text-lg mb-8 text-orange-100">
              Únete a miles de usuarios que ya están ganando puntos y disfrutando
              de increíbles premios.
            </p>

            {!user ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white text-[#F26D1F] hover:bg-orange-50 border-white text-lg px-8 py-3"
                  >
                    Crear Cuenta Gratis
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white text-[#F26D1F] hover:bg-orange-50 border-white text-lg px-8 py-3"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-8 text-center">
            <h3 className="text-lg font-semibold text-[#F26D1F] mb-4">
              Chipa&Co - Sistema de Fidelización
            </h3>
            <p className="text-gray-600 mb-6">
              La forma más fácil de ganar puntos y obtener premios increíbles.
            </p>

            {user && (
              <div className="flex justify-center space-x-6 text-sm mb-6">
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/cliente"}
                  className="text-[#F26D1F] hover:text-[#E55A1A] font-medium"
                >
                  Inicio
                </Link>
                <Link href={user.role === "ADMIN" ? "/admin/rewards" : "/cliente/rewards"} className="text-[#F26D1F] hover:text-[#E55A1A] font-medium">
                  Premios
                </Link>
                <Link href={user.role === "ADMIN" ? "/admin/ranking" : "/ranking"} className="text-[#F26D1F] hover:text-[#E55A1A] font-medium">
                  Ranking
                </Link>
                <Link href={user.role === "ADMIN" ? "/admin/orders" : "/history"} className="text-[#F26D1F] hover:text-[#E55A1A] font-medium">
                  Historial
                </Link>
              </div>
            )}

            <div className="pt-6 border-t border-gray-200 text-gray-500 text-sm">
              <p>
                &copy; 2025 Chipa&Co. Todos los derechos
                reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
