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
  const router = useRouter();

  useEffect(() => {
    fetchData();
    
    // Actualizar automáticamente cada 30 segundos para ver cambios de estado
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [historyRes, userRes] = await Promise.all([
        fetch(`/api/user/history?type=claims&limit=50`),
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
    return "🎁";
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
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎁 Mis Premios Canjeados
            </h1>
            <p className="text-gray-600">
              Revisa todos los premios que has canjeado con tus puntos.
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Actualizar</span>
          </button>
        </div>



        {/* Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-orange-100 mb-8">

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
                          Premio Canjeado
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

                      {item.details && (
                        <div className="text-sm text-gray-700">
                          <p className="font-medium">{item.details.reward}</p>
                          {item.details.description && (
                            <p>{item.details.description}</p>
                          )}
                          <span
                            className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
                              item.details.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : item.details.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.details.status === "APPROVED"
                              ? "Aprobado"
                              : item.details.status === "REJECTED"
                              ? "Rechazado"
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
