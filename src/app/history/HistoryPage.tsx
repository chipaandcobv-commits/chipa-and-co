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

interface HistoryItem {
  type: "scan" | "claim";
  id: string;
  date: Date;
  points: number;
  details: any;
}

interface UserStats {
  currentPoints: number;
  totalScans: number;
  totalClaims: number;
  totalPointsEarned: number;
  totalPointsSpent: number;
}

interface UserInfo {
  name: string;
  puntos: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "scans" | "claims">("all");
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const [historyRes, userRes] = await Promise.all([
        fetch(`/api/user/history?type=${filter}&limit=50`),
        fetch("/api/auth/me"),
      ]);

      const [historyData, userData] = await Promise.all([
        historyRes.json(),
        userRes.json(),
      ]);

      if (historyData.success) {
        setHistory(historyData.history);
        setStats(historyData.stats);
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (type: string) => {
    return type === "scan" ? "📱" : "🎁";
  };

  const getActivityColor = (points: number) => {
    return points > 0 ? "text-green-600" : "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-orange-600">Cargando historial...</div>
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
              <span className="text-gray-700">Historial</span>
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
            📊 Mi Historial
          </h1>
          <p className="text-gray-600">
            Revisa todas tus actividades de puntos y canjes.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">💎</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Puntos Actuales
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.currentPoints}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">📱</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    QR Escaneados
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalScans}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">🎁</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Premios Canjeados
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalClaims}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">⚡</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Ganados
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.totalPointsEarned}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-orange-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  filter === "all"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Todas las actividades
              </button>
              <button
                onClick={() => setFilter("scans")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  filter === "scans"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                QR Escaneados
              </button>
              <button
                onClick={() => setFilter("claims")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  filter === "claims"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Premios Canjeados
              </button>
            </nav>
          </div>

          {/* History List */}
          <div className="divide-y divide-gray-200">
            {history.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="p-6 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{getActivityIcon(item.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {item.type === "scan"
                            ? "QR Escaneado"
                            : "Premio Canjeado"}
                        </h3>
                        <span
                          className={`font-bold ${getActivityColor(
                            item.points
                          )}`}
                        >
                          {item.points > 0 ? "+" : ""}
                          {item.points} puntos
                        </span>
                      </div>

                      {item.type === "scan" && item.details && (
                        <div className="text-sm text-gray-600">
                          <p>Orden: {item.details.orderId}</p>
                          <p>
                            Total: ${item.details.totalAmount?.toLocaleString()}
                          </p>
                          {item.details.items && (
                            <div className="mt-1">
                              {item.details.items.map(
                                (orderItem: any, index: number) => (
                                  <span
                                    key={index}
                                    className="inline-block mr-2 text-xs bg-gray-100 px-2 py-1 rounded"
                                  >
                                    {orderItem.quantity}x {orderItem.product}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {item.type === "claim" && item.details && (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{item.details.reward}</p>
                          {item.details.description && (
                            <p>{item.details.description}</p>
                          )}
                          <span
                            className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
                              item.details.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.details.status === "COMPLETED"
                              ? "Completado"
                              : "Pendiente"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(item.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {history.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {filter === "all" && "No tienes actividad aún"}
                {filter === "scans" && "No has escaneado QR aún"}
                {filter === "claims" && "No has canjeado premios aún"}
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === "all" &&
                  "¡Comienza escaneando tu primer código QR!"}
                {filter === "scans" &&
                  "¡Escanea códigos QR de tus compras para ganar puntos!"}
                {filter === "claims" &&
                  "¡Ve a la sección de premios para canjear tus puntos!"}
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/rewards">
                  <Button variant="outline">Ver Premios</Button>
                </Link>
                <Link href="/ranking">
                  <Button variant="outline">Ver Ranking</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
