"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { DashboardIcon, LogoutIcon } from "../../../components/icons/Icons";

interface SystemConfig {
  pointsPerPeso: number;
}

export default function ConfigManagement() {
  const [config, setConfig] = useState<SystemConfig>({ pointsPerPeso: 1 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Cargar configuración actual
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/admin/config");
      const data = await response.json();

      if (data.success) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ configs: config }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Configuración guardada exitosamente");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Error al guardar configuración");
      }
    } catch (error) {
      setMessage("Error de conexión");
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F7EFE7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26D1F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
     
      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de bienvenida */}
        <div className="pt-4 mb-8">
          <div className="ml-4 rounded-l-full rounded-r-none bg-[#FCE6D5] py-3 pr-2 pl-4 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-600 text-sm">
              <span>⚙️</span>
            </div>
            <div className="leading-tight">
              <p className="text-[14px] font-medium text-neutral-800">
                Configuración del Sistema
              </p>
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#F26D1F] mb-2">
              Configuración del Sistema
            </h1>
            <p className="text-gray-700">
              Gestiona la configuración general del sistema de puntos
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

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puntos por Peso
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Define cuántos puntos se otorgan por cada peso gastado. 
                <strong className="text-[#F26D1F]"> Configuración actual: {config.pointsPerPeso} peso = {config.pointsPerPeso} punto</strong>
              </p>
              <Input
                type="number"
                value={config.pointsPerPeso}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    pointsPerPeso: parseFloat(e.target.value) || 1,
                  })
                }
                placeholder="1"
                min="0.01"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">
                Actual: $1 peso = {config.pointsPerPeso} punto(s)
              </p>
            </div>

            <div className="pt-4 border-t border-white">
              <Button
                onClick={handleSave}
                isLoading={saving}
                className="w-full sm:w-auto bg-[#F26D1F] hover:bg-[#E55A1A] text-white"
              >
                Guardar Configuración
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-8 p-4 bg-[#FCE6D5] rounded-lg">
            <h3 className="font-medium text-[#F26D1F] mb-2">Vista Previa</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                • Una compra de $1,000 = <span className="text-[#F26D1F] font-semibold">{Math.round(1000 * config.pointsPerPeso)} punto(s)</span>
              </p>
              <p>
                • Una compra de $5,000 = <span className="text-[#F26D1F] font-semibold">{Math.round(5000 * config.pointsPerPeso)} punto(s)</span>
              </p>
              <p>
                • Una compra de $10,000 = <span className="text-[#F26D1F] font-semibold">{Math.round(10000 * config.pointsPerPeso)} punto(s)</span>
              </p>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-[#F26D1F]">
              <p className="text-sm text-[#F26D1F] font-medium">
                💡 Configuración de Puntos: Define la relación entre pesos gastados y puntos otorgados
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
