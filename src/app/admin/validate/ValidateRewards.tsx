"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../../../components/ui/Button";
import {
  CheckIcon,
  XIcon,
} from "../../../components/icons/Icons";
import { DiamondIcon } from "lucide-react";

interface RewardClaim {
  id: string;
  reward: string;
  user: string;
  userDni: string;
  userEmail: string;
  pointsSpent: number;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ValidationStats {
  pending: number;
  total: number;
  approved: number;
  rejected: number;
}

export default function ValidateRewards() {
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [stats, setStats] = useState<ValidationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [validating, setValidating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await fetch("/api/admin/rewards/validate");
      const data = await response.json();

      if (data.success) {
        setClaims(data.claims);
        setStats(data.stats);
      } else {
        setMessage(data.error || "Error al cargar canjes");
      }
    } catch (error) {
      console.error("Error fetching claims:", error);
      setMessage("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const validateClaim = async (claimId: string, status: string, notes?: string) => {
    setValidating(claimId);
    setMessage("");

    try {
      const response = await fetch("/api/admin/rewards/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ claimId, status, notes }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        fetchClaims(); // Refresh data
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Error al validar premio");
      }
    } catch (error) {
      setMessage("Error de conexión");
    } finally {
      setValidating(null);
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendiente";
      case "APPROVED":
        return "Aprobado";
      case "REJECTED":
        return "Rechazado";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-orange-600">Cargando canjes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ✅ Validar Premios Canjeados
          </h1>
          <p className="text-gray-700">
            Revisa y valida los premios que los usuarios han canjeado.
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 border border-green-200">
            {message}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">⏳</div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">✅</div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Aprobados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.approved}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">❌</div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Rechazados</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.rejected}
                  </p>
                </div>
              </div>
            </div>



            <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">📊</div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Claims Table */}
        <div className="bg-white rounded-lg shadow-sm border border-orange-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Canjes Pendientes de Validación
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Premio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puntos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {claim.user}
                        </div>
                        <div className="text-sm text-gray-500">
                          DNI: {claim.userDni}
                        </div>
                        <div className="text-sm text-gray-500">
                          {claim.userEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {claim.reward}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-orange-600">
                        {'💎' + claim.pointsSpent}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(claim.createdAt).toLocaleDateString("es-ES")}
                      <br />
                      <span className="text-xs">
                        {new Date(claim.createdAt).toLocaleTimeString("es-ES")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          claim.status
                        )}`}
                      >
                        {getStatusText(claim.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => validateClaim(claim.id, "APPROVED")}
                          disabled={validating === claim.id}
                          variant="primary"
                          size="sm"
                          className="flex items-center"
                        >
                          <CheckIcon className="w-4 h-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          onClick={() => validateClaim(claim.id, "REJECTED")}
                          disabled={validating === claim.id}
                          variant="outline"
                          size="sm"
                          className="flex items-center text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <XIcon className="w-4 h-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {claims.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No hay canjes pendientes
              </h3>
              <p className="text-gray-600">
                ¡Todos los premios han sido validados!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
