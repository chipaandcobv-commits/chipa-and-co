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

interface RankingUser {
  id: string;
  name: string;
  puntos: number;
  rank: number;
}

interface UserInfo {
  name: string;
  puntos: number;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      const [rankingRes, userRes] = await Promise.all([
        fetch(`/api/ranking?page=${page}&limit=10`),
        fetch("/api/auth/me"),
      ]);

      const [rankingData, userData] = await Promise.all([
        rankingRes.json(),
        userRes.json(),
      ]);

      if (rankingData.success) {
        if (page === 1) {
          setRanking(rankingData.ranking);
        } else {
          setRanking((prev) => [...prev, ...rankingData.ranking]);
        }
        setHasMore(rankingData.hasMore);
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

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "🏆";
    }
  };

  const getUserRank = () => {
    if (!user) return null;
    const userInRanking = ranking.find((u) => u.puntos === user.puntos);
    return userInRanking?.rank;
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-orange-600">Cargando ranking...</div>
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
              <span className="text-gray-700">Ranking</span>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏆 Ranking de Usuarios
          </h1>
          <p className="text-gray-600">
            Los usuarios con más puntos acumulados. ¡Compite por llegar al top!
          </p>
        </div>

        {/* User's current position */}
        {user && (
          <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Tu Posición
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">
                  {getRankIcon(getUserRank() || 999)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">
                    {getUserRank()
                      ? `Posición #${getUserRank()}`
                      : "No apareces en el ranking aún"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">
                  {user.puntos}
                </p>
                <p className="text-sm text-gray-600">puntos</p>
              </div>
            </div>
          </div>
        )}

        {/* Ranking List */}
        <div className="bg-white rounded-lg shadow-sm border border-orange-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Top Usuarios
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {ranking.map((rankUser) => (
              <div
                key={rankUser.id}
                className="p-6 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200">
                    <span className="text-xl">
                      {getRankIcon(rankUser.rank)}
                    </span>
                  </div>
                  <div>
                    <h3
                      className={`font-medium ${
                        user && rankUser.name === user.name
                          ? "text-orange-600"
                          : "text-gray-900"
                      }`}
                    >
                      {rankUser.name}
                      {user && rankUser.name === user.name && " (Tú)"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Posición #{rankUser.rank}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    {rankUser.puntos.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">puntos</p>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="p-6 border-t border-gray-200 text-center">
              <Button onClick={loadMore} variant="outline" isLoading={loading}>
                Cargar Más
              </Button>
            </div>
          )}
        </div>

        {ranking.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Aún no hay usuarios en el ranking
            </h3>
            <p className="text-gray-600">¡Sé el primero en ganar puntos!</p>
          </div>
        )}

        {/* Achievement Info */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-orange-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            💎 ¿Cómo ganar puntos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">📱 Escanea QR</h3>
              <p className="text-gray-600 text-sm">
                Escanea códigos QR de tus compras para ganar puntos
                automáticamente.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                🎁 Canjea Premios
              </h3>
              <p className="text-gray-600 text-sm">
                Usa tus puntos para obtener increíbles premios y descuentos.
              </p>
            </div>
          </div>
          <div className="flex space-x-4 mt-6">
            <Link href="/rewards">
              <Button variant="outline">Ver Premios</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Mi Historial</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
