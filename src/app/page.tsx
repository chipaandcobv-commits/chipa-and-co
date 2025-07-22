import Link from "next/link";
import { PrismaClient } from "../generated/prisma";
import Button from "../components/ui/Button";
import { UserIcon, DashboardIcon } from "../components/icons/Icons";
import AuthHeader from "../components/AuthHeader";

// Forzar renderizado dinámico para evitar warnings de cookies
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function Home() {
  const users = await getUsers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header with client-side auth */}
      <AuthHeader />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-8">
            <UserIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            App de Fidelización
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Únete a nuestro programa de fidelización y disfruta de beneficios
            exclusivos, puntos por cada compra y recompensas increíbles.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Comenzar Ahora
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Usuarios Registrados
            </h2>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {users.length} usuarios
            </span>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12 bg-orange-50 rounded-lg">
              <UserIcon className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                No hay usuarios registrados aún
              </p>
              <p className="text-sm text-gray-500">
                ¡Sé el primero en unirte a nuestro programa!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-orange-50 p-6 rounded-lg border border-orange-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-orange-200">
                    <p className="text-xs text-gray-500">
                      Miembro desde:{" "}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Registro Fácil
            </h3>
            <p className="text-gray-600">
              Créate una cuenta en segundos y comienza a acumular puntos al
              instante.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DashboardIcon className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Dashboard Personal
            </h3>
            <p className="text-gray-600">
              Monitorea tus puntos, nivel de fidelización y recompensas
              disponibles.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-8 w-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Recompensas Exclusivas
            </h3>
            <p className="text-gray-600">
              Canjea tus puntos por descuentos, productos gratis y beneficios
              especiales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
