"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";
import { DashboardIcon, LogoutIcon } from "../../components/icons/Icons";
import SimpleChart from "../../components/charts/SimpleChart";

interface Analytics {
  summary: {
    totalUsers: number;
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    completedOrders: number;
    totalPointsDistributed: number;
    totalPointsSpent: number;
    totalHistoricPoints: number;
    totalCurrentPoints: number;
  };
  ordersByDay: Record<string, { total: number; points: number; orders: number }>;
  topProducts: Array<{
    product: {
      id: string;
      name: string;
      price: number;
    };
    totalSales: number;
    totalQuantity: number;
    orderCount: number;
  }>;
  projections: {
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
  };
  rewardStats: {
    totalClaims: number;
    pointsSpent: number;
  };
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics?period=30");
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError(data.error || "Error al cargar datos");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F7EFE7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A25] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-[#F7EFE7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const chartData = analytics && analytics.ordersByDay
    ? Object.keys(analytics.ordersByDay)
        .slice(-7)
        .reduce((acc, date, index) => {
          const dayValues = Object.values(analytics.ordersByDay).slice(-7)[index];
          acc[date] = {
            total: dayValues.total,
            quantity: dayValues.orders,
            sales: dayValues.orders,
          };
          return acc;
        }, {} as Record<string, { total: number; quantity: number; sales: number }>)
    : {};

  return (
    <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <div className="flex items-center">
              <div className="text-2xl mr-3">👥</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios</p>
                <p className="text-2xl font-bold text-[#F15A25]">
                  {analytics?.summary.totalUsers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📦</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Productos</p>
                <p className="text-2xl font-bold text-[#F15A25]">
                  {analytics?.summary.activeProducts || 0}
                </p>
                <p className="text-xs text-gray-500">
                  de {analytics?.summary.totalProducts || 0} total
                </p>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🛒</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Órdenes</p>
                <p className="text-2xl font-bold text-[#F15A25]">
                  {analytics?.summary.totalOrders || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {analytics?.summary.completedOrders || 0} completadas
                </p>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <div className="flex items-center">
              <div className="text-2xl mr-3">💎</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Puntos Actuales</p>
                <p className="text-2xl font-bold text-[#F15A25]">
                  {analytics?.summary.totalCurrentPoints?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {analytics?.summary.totalPointsSpent || 0} gastados
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Puntos Históricos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📈</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Puntos Históricos</p>
                <p className="text-2xl font-bold text-[#F15A25]">
                  {analytics?.summary.totalHistoricPoints?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500">
                  Total acumulado por todos los usuarios
                </p>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📊</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio por Usuario</p>
                <p className="text-2xl font-bold text-[#F15A25]">
                  {analytics?.summary.totalUsers 
                    ? Math.round((analytics?.summary.totalHistoricPoints || 0) / analytics?.summary.totalUsers)
                    : 0
                  }
                </p>
                <p className="text-xs text-gray-500">
                  Puntos históricos promedio
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart */}
          <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <h2 className="text-lg font-semibold text-[#F15A25] mb-4">
              Ventas de los últimos 7 días
            </h2>
            <SimpleChart data={chartData} />
          </div>

          {/* Top Products */}
          <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <h2 className="text-lg font-semibold text-[#F15A25] mb-4">
              Productos más populares
            </h2>
            <div className="space-y-4">
              {analytics?.topProducts.slice(0, 5).map((item, index) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-[#F15A25] text-white rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${item.product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${item.totalSales.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.totalQuantity} unidades
                    </p>
                  </div>
                </div>
              )) || []}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 sm:mt-8 relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-4 sm:p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
          <h2 className="text-lg font-semibold text-[#F15A25] mb-6">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Link href="/admin/users">
              <div className="relative rounded-xl bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-white/50 p-4 hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] hover:bg-[#FCE6D5] transition-all duration-300 group cursor-pointer">
                <div className="flex flex-col items-center justify-center h-20">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">👥</div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#F15A25] transition-colors duration-300">Usuarios</span>
                </div>
              </div>
            </Link>

            <Link href="/admin/orders">
              <div className="relative rounded-xl bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-white/50 p-4 hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] hover:bg-[#FCE6D5] transition-all duration-300 group cursor-pointer">
                <div className="flex flex-col items-center justify-center h-20">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🛒</div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#F15A25] transition-colors duration-300">Crear Órdenes</span>
                </div>
              </div>
            </Link>

            <Link href="/admin/products">
              <div className="relative rounded-xl bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-white/50 p-4 hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] hover:bg-[#FCE6D5] transition-all duration-300 group cursor-pointer">
                <div className="flex flex-col items-center justify-center h-20">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">📦</div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#F15A25] transition-colors duration-300">Gestionar Productos</span>
                </div>
              </div>
            </Link>

            <Link href="/admin/rewards">
              <div className="relative rounded-xl bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-white/50 p-4 hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] hover:bg-[#FCE6D5] transition-all duration-300 group cursor-pointer">
                <div className="flex flex-col items-center justify-center h-20">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🎁</div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#F15A25] transition-colors duration-300">Gestionar Premios</span>
                </div>
              </div>
            </Link>

            <Link href="/admin/ranking">
              <div className="relative rounded-xl bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-white/50 p-4 hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] hover:bg-[#FCE6D5] transition-all duration-300 group cursor-pointer">
                <div className="flex flex-col items-center justify-center h-20">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">🏆</div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#F15A25] transition-colors duration-300">Ranking</span>
                </div>
              </div>
            </Link>

            <Link href="/admin/validate">
              <div className="relative rounded-xl bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-white/50 p-4 hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] hover:bg-[#FCE6D5] transition-all duration-300 group cursor-pointer">
                <div className="flex flex-col items-center justify-center h-20">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">✅</div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#F15A25] transition-colors duration-300">Validar Premios</span>
                </div>
              </div>
            </Link>

            <Link href="/admin/config">
              <div className="relative rounded-xl bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-white/50 p-4 hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] hover:bg-[#FCE6D5] transition-all duration-300 group cursor-pointer">
                <div className="flex flex-col items-center justify-center h-20">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">⚙️</div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#F15A25] transition-colors duration-300">Configuración</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
