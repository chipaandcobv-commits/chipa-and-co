"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import AdminRedirect from "@/components/AdminRedirect";
import { useAutoCleanup } from "@/lib/hooks/useAutoCleanup";

interface ExpiredStats {
  expiredPending: number;
  expiredToDelete: number;
  totalExpired: number;
}

export default function ExpiredRewardsPage() {
  const [stats, setStats] = useState<ExpiredStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { user, loading: userLoading } = useAuth();

  // Ejecutar limpieza automática de premios vencidos al cargar la página
  useAutoCleanup();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/rewards/expire");
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al cargar estadísticas" });
    }
  };

  const handleCleanup = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/rewards/expire", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        fetchStats(); // Recargar estadísticas
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al ejecutar limpieza" });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Premios Vencidos
          </h1>
          <p className="text-gray-600">
            Administra los premios que han expirado y necesitan ser procesados
          </p>
        </div>

        {/* Mensaje de notificación */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === "success" 
              ? "bg-green-50 border border-green-200 text-green-800" 
              : "bg-red-50 border border-red-200 text-red-800"
          }`}>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendientes por Vencer</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.expiredPending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Listos para Eliminar</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.expiredToDelete}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Vencidos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalExpired}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Acciones de Limpieza
          </h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Proceso Automático</h3>
              <p className="text-sm text-blue-700 mb-3">
                Este proceso realizará las siguientes acciones:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Marcar premios pendientes que han expirado (más de 24 horas) como &quot;vencidos&quot;</li>
                <li>• Eliminar premios vencidos que tienen más de 48 horas</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCleanup}
                disabled={loading}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  "Ejecutar Limpieza"
                )}
              </button>

              <button
                onClick={fetchStats}
                disabled={loading}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Actualizar Estadísticas
              </button>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h3 className="font-medium text-yellow-900 mb-2">Información Importante</h3>
          <div className="text-sm text-yellow-800 space-y-2">
            <p>
              <strong>Vencimiento:</strong> Los premios tienen 24 horas para ser reclamados desde el momento del canje.
            </p>
            <p>
              <strong>Eliminación:</strong> Los premios vencidos se eliminan automáticamente después de 48 horas adicionales (72 horas total desde el canje).
            </p>
            <p>
              <strong>Proceso Manual:</strong> Puedes ejecutar la limpieza manualmente usando el botón de arriba.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
