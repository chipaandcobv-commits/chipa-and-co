"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../../../components/ui/Button";
import {
  TrophyIcon,
} from "../../../components/icons/Icons";

interface RankingUser {
  position: number;
  id: string;
  name: string;
  email: string;
  dni: string;
  puntosActuales: number;
  puntosHistoricos: number;
  totalCompras: number;
  totalCanjes: number;
  fechaRegistro: string;
}

interface RankingStats {
  totalUsers: number;
  totalHistoricPoints: number;
  totalCurrentPoints: number;
  totalOrders: number;
  totalClaims: number;
  promedioPuntosHistoricos: number;
  promedioPuntosActuales: number;
}

export default function RankingManagement() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [stats, setStats] = useState<RankingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const response = await fetch("/api/admin/ranking");
      const data = await response.json();

      if (data.success) {
        setRanking(data.ranking);
        setStats(data.stats);
      } else {
        setMessage(data.error || "Error al cargar el ranking");
      }
    } catch (error) {
      console.error("Error fetching ranking:", error);
      setMessage("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F7EFE7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A25] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F15A25] mb-2">
            🏆 Ranking de Usuarios
          </h1>
          <p className="text-gray-700">
            Ranking de usuarios ordenados por puntos históricos totales.
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
            {message}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="flex items-center">
                <div className="text-2xl mr-3">👥</div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Total Usuarios
                  </p>
                  <p className="text-2xl font-bold text-[#F15A25]">
                    {stats.totalUsers}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="flex items-center">
                <div className="text-2xl mr-3">💎</div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Puntos Históricos
                  </p>
                  <p className="text-2xl font-bold text-[#F15A25]">
                    {stats.totalHistoricPoints.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="flex items-center">
                <div className="text-2xl mr-3">🛒</div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Total Compras
                  </p>
                  <p className="text-2xl font-bold text-[#F15A25]">
                    {stats.totalOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
              <div className="flex items-center">
                <div className="text-2xl mr-3">📊</div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Promedio Histórico
                  </p>
                  <p className="text-2xl font-bold text-[#F15A25]">
                    {stats.promedioPuntosHistoricos.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ranking Table */}
        <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white overflow-hidden hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
          <div className="px-6 py-4 border-b border-white bg-[#FCE6D5]">
            <h2 className="text-xl font-semibold text-[#F15A25]">
              Top Usuarios por Puntos Históricos
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white">
              <thead className="bg-[#FCE6D5]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Posición
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Puntos Actuales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Puntos Históricos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Compras
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Canjes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Registro
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#F4E7DB] divide-y divide-white">
                {ranking.map((user) => (
                  <tr key={user.id} className="hover:bg-[#FCE6D5] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.position === 1 && (
                          <TrophyIcon className="w-5 h-5 text-yellow-500 mr-2" />
                        )}
                        {user.position === 2 && (
                          <TrophyIcon className="w-5 h-5 text-gray-400 mr-2" />
                        )}
                        {user.position === 3 && (
                          <TrophyIcon className="w-5 h-5 text-orange-600 mr-2" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          #{user.position}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.dni}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-[#F15A25]">
                        {user.puntosActuales.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-[#F15A25]">
                        {user.puntosHistoricos.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.totalCompras}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.totalCanjes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.fechaRegistro).toLocaleDateString("es-ES")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {ranking.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No hay usuarios registrados
              </h3>
              <p className="text-gray-600">
                Los usuarios aparecerán aquí una vez que comiencen a acumular puntos.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
