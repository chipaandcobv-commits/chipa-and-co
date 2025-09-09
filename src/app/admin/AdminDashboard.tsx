"use client";

import { useState, useEffect } from "react";
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
      </main>
    </div>
  );
}
