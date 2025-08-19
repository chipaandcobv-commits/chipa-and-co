"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";


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
  const [filter, setFilter] = useState<"all" | "scans" | "claims">("claims");
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

      if (historyData.success && Array.isArray(historyData.history)) {
        setHistory(historyData.history);
        setStats(historyData.stats);
      } else {
        setHistory([]);
        setStats(null);
      }

      if (userData.success) {
        setUser(userData.user);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHistory([]);
      setStats(null);
    } finally {
      setLoading(false);
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
      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎁 Mis Premios Canjeados
          </h1>
          <p className="text-gray-600">
            Revisa todos los premios que has canjeado con tus puntos.
          </p>
        </div>



        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-orange-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
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

              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  filter === "all"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Todos los Premios
              </button>
            </nav>
          </div>

          {/* History List */}
          <div className="divide-y divide-gray-200">
            {Array.isArray(history) && history.map((item) => (
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
                            ? "Compra Registrada"
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
                        <div className="text-sm text-gray-700">
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
                        <div className="text-sm text-gray-700">
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
                  <div className="text-sm text-gray-600">
                    {formatDate(item.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(!Array.isArray(history) || history.length === 0) && (
                          <div className="text-center py-12">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No has canjeado premios aún
                </h3>
                <p className="text-gray-700 mb-4">
                  ¡Ve a la sección de premios para canjear tus puntos!
                </p>
              <div className="flex justify-center space-x-4">
                <Link href="/rewards">
                  <Button variant="outline">Ver Premios</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
