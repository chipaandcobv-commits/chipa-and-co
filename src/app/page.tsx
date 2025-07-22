import Link from "next/link";
import { getCurrentUser } from "../lib/auth";
import Button from "../components/ui/Button";
import { DashboardIcon, HomeIcon } from "../components/icons/Icons";

export const dynamic = "force-dynamic";

async function AuthHeader() {
  const currentUser = await getCurrentUser();

  return (
    <header className="bg-white shadow-sm border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <HomeIcon className="w-8 h-8 text-orange-600" />
            <h1 className="text-xl font-bold text-gray-900">
              Sistema de Fidelización
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Hola, <span className="font-medium">{currentUser.name}</span>
                </span>
                <Link href="/dashboard">
                  <Button size="sm" className="flex items-center">
                    <DashboardIcon className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                {currentUser.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center"
                    >
                      ⚙️ Admin
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <AuthHeader />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Gana puntos con cada compra
            <span className="text-orange-600">💎</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Escanea códigos QR, acumula puntos y canjea increíbles premios. ¡Es
            fácil, rápido y completamente gratuito!
          </p>

          {!currentUser ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-3">
                  Comenzar Ahora
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-3"
                >
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8 py-3">
                  <DashboardIcon className="w-5 h-5 mr-2" />
                  Ir al Dashboard
                </Button>
              </Link>
              <Link href="/rewards">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-3"
                >
                  🎁 Ver Premios
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-lg text-gray-600">
              Simple, rápido y completamente automático
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🛒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                1. Compra
              </h3>
              <p className="text-gray-600">
                Realiza compras en cualquiera de nuestros establecimientos
                participantes.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                2. Escanea
              </h3>
              <p className="text-gray-600">
                Escanea el código QR de tu ticket para ganar puntos
                automáticamente.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🎁</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3. Canjea
              </h3>
              <p className="text-gray-600">
                Usa tus puntos para obtener descuentos, productos gratuitos y
                premios exclusivos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Beneficios Exclusivos
            </h2>
            <p className="text-lg text-gray-600">
              Descubre todo lo que puedes obtener
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6 text-center">
              <div className="text-3xl mb-3">💎</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Puntos por Compra
              </h3>
              <p className="text-sm text-gray-600">
                Gana puntos automáticamente con cada compra
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6 text-center">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Sistema de Ranking
              </h3>
              <p className="text-sm text-gray-600">
                Compite con otros usuarios y alcanza la cima
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Premios Variados
              </h3>
              <p className="text-sm text-gray-600">
                Descuentos, productos gratis y experiencias únicas
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6 text-center">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Fácil de Usar
              </h3>
              <p className="text-sm text-gray-600">
                Solo escanea y disfruta, sin complicaciones
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
          <p className="text-xl mb-8 text-orange-100">
            Únete a miles de usuarios que ya están ganando puntos y disfrutando
            de increíbles premios.
          </p>

          {!currentUser ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-orange-600 hover:bg-orange-50 border-white text-lg px-8 py-3"
                >
                  Crear Cuenta Gratis
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-orange-700 hover:bg-orange-800 text-lg px-8 py-3"
                >
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/rewards">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-orange-600 hover:bg-orange-50 border-white text-lg px-8 py-3"
                >
                  🎁 Explorar Premios
                </Button>
              </Link>
              <Link href="/ranking">
                <Button
                  size="lg"
                  className="bg-orange-700 hover:bg-orange-800 text-lg px-8 py-3"
                >
                  🏆 Ver Ranking
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-lg font-semibold mb-4">
            Sistema de Fidelización
          </h3>
          <p className="text-gray-400 mb-6">
            La forma más fácil de ganar puntos y obtener premios increíbles.
          </p>

          {currentUser && (
            <div className="flex justify-center space-x-6 text-sm">
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-white"
              >
                Dashboard
              </Link>
              <Link href="/rewards" className="text-gray-400 hover:text-white">
                Premios
              </Link>
              <Link href="/ranking" className="text-gray-400 hover:text-white">
                Ranking
              </Link>
              <Link href="/history" className="text-gray-400 hover:text-white">
                Historial
              </Link>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-gray-800 text-gray-400 text-sm">
            <p>
              &copy; 2024 Sistema de Fidelización. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
