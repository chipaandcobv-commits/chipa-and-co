"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";

interface User {
  name: string;
  email: string;
  dni: string;
  puntos: number;
  role: string;
}

interface UserStats {
  currentPoints: number;
  totalOrders: number;
  totalClaims: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
}

export default function DashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [userResponse, historyResponse] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/user/history?type=all&limit=1"),
      ]);

      const [userData, historyData] = await Promise.all([
        userResponse.json(),
        historyResponse.json(),
      ]);

      if (userData.success) {
        setUser(userData.user);
      }

      if (historyData.success) {
        setStats(historyData.stats);
      }
    } catch {
      setError("Error al cargar datos del usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-orange-600">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Administra tus puntos y descubre increíbles premios.
          </p>
          {user?.dni && (
            <p className="text-sm text-gray-500 mt-1">
              DNI: {user.dni}
            </p>
          )}
        </div>

        {/* Points Card */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Tus Puntos</h2>
              <p className="text-orange-100">Puntos disponibles para canjear</p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold">{user?.puntos || 0}</p>
              <p className="text-orange-100">💎 puntos</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">🛒</div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Órdenes Realizadas
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">🎁</div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Premios Canjeados
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalClaims}
                  </p>
                </div>
              </div>
            </div>




          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/rewards">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center hover:bg-orange-50"
              >
                <div className="text-3xl mb-2">🎁</div>
                <span className="font-medium">Ver Premios</span>
                <span className="text-xs text-gray-500">Canjea tus puntos</span>
              </Button>
            </Link>

            <Link href="/history">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center hover:bg-orange-50"
              >
                <div className="text-3xl mb-2">📋</div>
                <span className="font-medium">Mis Premios</span>
                <span className="text-xs text-gray-500">
                  Premios canjeados
                </span>
              </Button>
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            ¿Cómo funciona? 🤔
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">
                1. Compra productos
              </h3>
              <p className="text-sm text-gray-600">
                Realiza compras en nuestros establecimientos participantes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">
                2. Presenta tu DNI
              </h3>
              <p className="text-sm text-gray-600">
                Al momento de la compra, presenta tu DNI para que se te asignen los puntos automáticamente.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">
                3. Canjea premios
              </h3>
              <p className="text-sm text-gray-600">
                Usa tus puntos para obtener descuentos y premios exclusivos.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
