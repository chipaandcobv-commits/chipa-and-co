"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";
import {
  DashboardIcon,
  HomeIcon,
  LogoutIcon,
} from "../../components/icons/Icons";

interface Reward {
  id: string;
  name: string;
  description: string | null;
  pointsCost: number;
  stock: number | null;
  isActive: boolean;
  imageUrl: string | null;
}

interface UserInfo {
  name: string;
  puntos: number;
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rewardsRes, userRes] = await Promise.all([
        fetch("/api/rewards"),
        fetch("/api/auth/me"),
      ]);

      const [rewardsData, userData] = await Promise.all([
        rewardsRes.json(),
        userRes.json(),
      ]);

      if (rewardsData.success) {
        setRewards(rewardsData.rewards);
      }

      if (userData.success) {
        setUser(userData.user);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (rewardId: string) => {
    setClaiming(rewardId);
    setMessage("");

    try {
      const response = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rewardId }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("¡Premio canjeado exitosamente!");
        fetchData(); // Refresh data
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Error al canjear premio");
      }
    } catch (error) {
      setMessage("Error de conexión");
    } finally {
      setClaiming(null);
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

  const canClaimReward = (reward: Reward) => {
    if (!user) return false;
    if (!reward.isActive) return false;
    if (reward.stock !== null && reward.stock <= 0) return false;
    return user.puntos >= reward.pointsCost;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-orange-600">Cargando premios...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-orange-600 hover:text-orange-700"
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                Inicio
              </Link>
              <span className="text-gray-300">/</span>
              <Link
                href="/dashboard"
                className="flex items-center text-orange-600 hover:text-orange-700"
              >
                <DashboardIcon className="w-5 h-5 mr-2" />
                Dashboard
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-700">Premios</span>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-sm">
                  <span className="text-gray-600">Hola, </span>
                  <span className="font-medium text-gray-900">{user.name}</span>
                  <span className="ml-3 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                    💎 {user.puntos} puntos
                  </span>
                </div>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <LogoutIcon className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎁 Premios Disponibles
          </h1>
          <p className="text-gray-600">
            Canjea tus puntos por increíbles premios. Tienes{" "}
            <strong>{user?.puntos || 0} puntos</strong> disponibles.
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes("Error")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-white rounded-lg shadow-sm border border-orange-100 overflow-hidden"
            >
              {/* Image placeholder */}
              <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                {reward.imageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={reward.imageUrl}
                      alt={reward.name}
                      className="w-full h-full object-cover"
                    />
                  </>
                ) : (
                  <div className="text-6xl">🎁</div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {reward.name}
                  </h3>
                  <span className="text-lg font-bold text-orange-600">
                    💎 {reward.pointsCost}
                  </span>
                </div>

                {reward.description && (
                  <p className="text-gray-600 text-sm mb-4">
                    {reward.description}
                  </p>
                )}

                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>
                    Stock: {reward.stock === null ? "Ilimitado" : reward.stock}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      reward.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {reward.isActive ? "Disponible" : "No disponible"}
                  </span>
                </div>

                <Button
                  onClick={() => claimReward(reward.id)}
                  disabled={!canClaimReward(reward)}
                  isLoading={claiming === reward.id}
                  className="w-full"
                  variant={canClaimReward(reward) ? "primary" : "outline"}
                >
                  {!reward.isActive
                    ? "No disponible"
                    : reward.stock !== null && reward.stock <= 0
                    ? "Sin stock"
                    : !user || user.puntos < reward.pointsCost
                    ? `Necesitas ${
                        reward.pointsCost - (user?.puntos || 0)
                      } puntos más`
                    : "Canjear Premio"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {rewards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No hay premios disponibles
            </h3>
            <p className="text-gray-600">
              ¡Vuelve pronto para ver nuevos premios!
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-orange-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ¿Necesitas más puntos?
          </h2>
          <p className="text-gray-600 mb-4">
            Escanea códigos QR de tus compras para ganar puntos y poder canjear
            estos increíbles premios.
          </p>
          <div className="flex space-x-4">
            <Link href="/dashboard">
              <Button variant="outline">Ver mi historial</Button>
            </Link>
            <Link href="/ranking">
              <Button variant="outline">Ver ranking</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
