"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";
import {
  LogoutIcon,
  DashboardIcon,
  UserIcon,
  HomeIcon,
} from "../../components/icons/Icons";
import { TokenPayload } from "../../lib/auth";

interface DashboardClientProps {
  user: TokenPayload;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center">
                <DashboardIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  App Fidelización
                </h1>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-orange-600" />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                isLoading={isLoggingOut}
              >
                <LogoutIcon className="h-4 w-4" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-6">
              <UserIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Bienvenido, {user.name}!
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Estás logueado en tu dashboard personal. Aquí podrás gestionar tu
              perfil, ver tus puntos de fidelización y mucho más.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <DashboardIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Puntos Totales
                </p>
                <p className="text-2xl font-bold text-gray-900">1,250</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <UserIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Nivel</p>
                <p className="text-2xl font-bold text-gray-900">Plata</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <HomeIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Visitas</p>
                <p className="text-2xl font-bold text-gray-900">42</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Acciones Rápidas
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="secondary"
              className="h-20 flex flex-col justify-center"
            >
              <UserIcon className="h-6 w-6 mb-2" />
              Ver Perfil
            </Button>

            <Button
              variant="secondary"
              className="h-20 flex flex-col justify-center"
            >
              <DashboardIcon className="h-6 w-6 mb-2" />
              Historial
            </Button>

            <Button
              variant="secondary"
              className="h-20 flex flex-col justify-center"
            >
              <HomeIcon className="h-6 w-6 mb-2" />
              Recompensas
            </Button>

            <Button
              variant="primary"
              className="h-20 flex flex-col justify-center"
              onClick={() => router.push("/")}
            >
              <HomeIcon className="h-6 w-6 mb-2" />
              Ir al Inicio
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
