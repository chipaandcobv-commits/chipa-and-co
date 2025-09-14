"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import SecurityKeyModal from "../../../components/SecurityKeyModal";
import { DashboardIcon, LogoutIcon, EyeIcon, EyeOffIcon } from "../../../components/icons/Icons";
import { Settings } from "lucide-react";

interface SystemConfig {
  pointsPerPeso: number;
  pointsLimit: number;
}

export default function ConfigManagement() {
  const [config, setConfig] = useState<SystemConfig>({ pointsPerPeso: 1, pointsLimit: 10000 });
  const [originalConfig, setOriginalConfig] = useState<SystemConfig>({ pointsPerPeso: 1, pointsLimit: 10000 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [message, setMessage] = useState("");
  const [recalculationProgress, setRecalculationProgress] = useState<{
    isRunning: boolean;
    progress: number;
    total: number;
    processed: number;
  }>({
    isRunning: false,
    progress: 0,
    total: 0,
    processed: 0,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecurityKeyModal, setShowSecurityKeyModal] = useState(false);
  const [isSecurityKeyValidated, setIsSecurityKeyValidated] = useState(false);
  const router = useRouter();

  // Cargar configuración actual
  useEffect(() => {
    fetchConfig();
  }, []);

  // No mostrar modal automáticamente, solo cuando el usuario haga clic

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/admin/config");
      const data = await response.json();

      if (data.success) {
        setConfig(data.config);
        setOriginalConfig(data.config); // Guardar configuración original
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
        setOriginalConfig(config); // Actualizar configuración original
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

  const handleRecalculatePoints = async () => {
    if (!confirm("¿Estás seguro de que quieres recalcular los puntos de todos los usuarios? Esta acción no se puede deshacer.")) {
      return;
    }

    setRecalculating(true);
    setRecalculationProgress({
      isRunning: true,
      progress: 0,
      total: 0,
      processed: 0,
    });
    setMessage("🔄 Iniciando recálculo de puntos...");

    try {
      const response = await fetch("/api/admin/config/recalculate-points-async", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPointsPerPeso: originalConfig.pointsPerPeso,
          newPointsPerPeso: config.pointsPerPeso,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
        setOriginalConfig(config); // Actualizar configuración original
        setTimeout(() => setMessage(""), 8000);
      } else {
        setMessage(`❌ ${data.error || "Error al recalcular puntos"}`);
      }
    } catch (error) {
      setMessage("❌ Error de conexión al recalcular puntos");
    } finally {
      setRecalculating(false);
      setRecalculationProgress({
        isRunning: false,
        progress: 100,
        total: 0,
        processed: 0,
      });
    }
  };

  const handleCleanupRewards = async () => {
    if (!confirm("¿Estás seguro de que quieres ejecutar la limpieza de premios vencidos? Esta acción eliminará permanentemente los premios que han caducado.")) {
      return;
    }

    setCleaning(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/cleanup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${data.message}`);
        setTimeout(() => setMessage(""), 5000);
      } else {
        setMessage(`❌ ${data.error || "Error al ejecutar limpieza"}`);
      }
    } catch (error) {
      setMessage("❌ Error de conexión al ejecutar limpieza");
    } finally {
      setCleaning(false);
    }
  };

  // Verificar si la configuración ha cambiado
  const hasPointsPerPesoChanged = originalConfig.pointsPerPeso !== config.pointsPerPeso;
  const hasPointsLimitChanged = originalConfig.pointsLimit !== config.pointsLimit;
  const hasConfigChanged = hasPointsPerPesoChanged || hasPointsLimitChanged;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("Las contraseñas nuevas no coinciden");
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage("La nueva contraseña debe tener al menos 6 caracteres");
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    try {
      const response = await fetch("/api/admin/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setMessage(""), 5000);
      } else {
        setMessage(data.error || "Error al cambiar contraseña");
      }
    } catch (error) {
      setMessage("Error de conexión");
    }
  };

  const handleSecurityKeySuccess = () => {
    setIsSecurityKeyValidated(true);
    setShowSecurityKeyModal(false);
  };

  const handleSecurityKeyClose = () => {
    // Solo cerrar el modal, no redirigir
    setShowSecurityKeyModal(false);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A25] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  // Si no se ha validado la clave de seguridad, mostrar contenido bloqueado
  if (!isSecurityKeyValidated) {
    return (
      <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#F15A25] mb-4">
                🔐 Configuración del Sistema
              </h1>
              <p className="text-gray-700 text-lg">
                Esta sección requiere autenticación adicional por seguridad
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-8 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
                <div className="w-16 h-16 bg-[#F15A25] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-[#F15A25] mb-4">
                  Acceso Restringido
                </h2>
                <p className="text-gray-700 mb-6">
                  Para acceder a la configuración del sistema, necesitas ingresar la clave de seguridad.
                </p>
                <Button
                  onClick={() => setShowSecurityKeyModal(true)}
                  className="w-full bg-[#F15A25] hover:bg-[#E55A1A] text-white"
                >
                  🔑 Ingresar Clave de Seguridad
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Modal de clave de seguridad */}
        <SecurityKeyModal
          isOpen={showSecurityKeyModal}
          onSuccess={handleSecurityKeySuccess}
          onClose={() => setShowSecurityKeyModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
     
      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuración de Puntos por Peso */}
          <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#F15A25] mb-2">
                💰 Puntos por Peso
              </h1>
              <p className="text-gray-700">
                Configura cuántos puntos se otorgan por cada peso gastado
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equivalencia de Puntos
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Define cuántos puntos se otorgan por cada peso gastado. 
                  <strong className="text-[#F15A25]"> Configuración actual: {config.pointsPerPeso} peso = {config.pointsPerPeso} punto</strong>
                </p>
                <div className="relative">
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
                    className={originalConfig.pointsPerPeso !== config.pointsPerPeso ? "border-[#F59E0B] ring-2 ring-[#F59E0B] ring-opacity-20" : ""}
                  />
                  {originalConfig.pointsPerPeso !== config.pointsPerPeso && (
                    <div className="absolute -top-2 -right-2 bg-[#F59E0B] text-white text-xs px-2 py-1 rounded-full">
                      Cambió
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Actual: $1 peso = {config.pointsPerPeso} punto(s)
                  {originalConfig.pointsPerPeso !== config.pointsPerPeso && (
                    <span className="text-[#F59E0B] font-medium">
                      {" "}(antes: {originalConfig.pointsPerPeso})
                    </span>
                  )}
                </p>
              </div>

              <div className="pt-4 border-t border-white">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSave}
                    isLoading={saving}
                    className="flex-1 bg-[#F15A25] hover:bg-[#E55A1A] text-white"
                  >
                    Guardar Configuración
                  </Button>
                  
                  {originalConfig.pointsPerPeso !== config.pointsPerPeso && (
                    <Button
                      onClick={handleRecalculatePoints}
                      isLoading={recalculating}
                      disabled={recalculating}
                      className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white disabled:opacity-50"
                    >
                      {recalculating ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Recalculando...
                        </div>
                      ) : (
                        "🔄 Recalcular Puntos"
                      )}
                    </Button>
                  )}
                </div>
                
                {/* Indicador de progreso */}
                {recalculationProgress.isRunning && (
                  <div className="mt-4 p-4 bg-[#F0F9FF] border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">🔄 Recalculando puntos...</span>
                      <span className="text-sm text-blue-600">
                        {recalculationProgress.processed > 0 && (
                          `${recalculationProgress.processed}/${recalculationProgress.total} usuarios`
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${recalculationProgress.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      ⏱️ Este proceso puede tomar varios minutos dependiendo del número de usuarios...
                    </p>
                  </div>
                )}
                
                {originalConfig.pointsPerPeso !== config.pointsPerPeso && (
                  <div className="mt-4 p-4 bg-[#FEF3C7] border border-[#F59E0B] rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-[#D97706]">⚠️ Cambio en Sistema de Puntos</h4>
                      <Button
                        onClick={() => {
                          setConfig(originalConfig);
                          setMessage("Cambios revertidos");
                          setTimeout(() => setMessage(""), 3000);
                        }}
                        size="sm"
                        variant="outline"
                        className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#FEF3C7]"
                      >
                        ↩️ Revertir
                      </Button>
                    </div>
                    <div className="text-sm text-[#92400E] space-y-2">
                      <p>
                        <strong>Configuración anterior:</strong> {originalConfig.pointsPerPeso} peso = {originalConfig.pointsPerPeso} punto
                      </p>
                      <p>
                        <strong>Nueva configuración:</strong> {config.pointsPerPeso} peso = {config.pointsPerPeso} punto
                      </p>
                      <p>
                        <strong>Factor de cambio:</strong> {(config.pointsPerPeso / originalConfig.pointsPerPeso).toFixed(2)}x
                      </p>
                      <p className="text-xs">
                        💡 Después de guardar, usa &quot;Recalcular Puntos&quot; para actualizar proporcionalmente 
                        los puntos actuales e históricos de todos los usuarios.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="mt-8 p-4 bg-[#FCE6D5] rounded-lg">
              <h3 className="font-medium text-[#F15A25] mb-2">Vista Previa</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  • Una compra de $1,000 = <span className="text-[#F15A25] font-semibold">{Math.round(1000 * config.pointsPerPeso)} punto(s)</span>
                </p>
                <p>
                  • Una compra de $5,000 = <span className="text-[#F15A25] font-semibold">{Math.round(5000 * config.pointsPerPeso)} punto(s)</span>
                </p>
                <p>
                  • Una compra de $10,000 = <span className="text-[#F15A25] font-semibold">{Math.round(10000 * config.pointsPerPeso)} punto(s)</span>
                </p>
              </div>
              
              {originalConfig.pointsPerPeso !== config.pointsPerPeso && (
                <div className="mt-3 p-3 bg-[#FEF3C7] rounded border border-[#F59E0B]">
                  <h4 className="text-sm font-medium text-[#D97706] mb-2">📊 Impacto del Cambio</h4>
                  <div className="text-xs text-[#92400E] space-y-1">
                    <p>• <strong>Antes:</strong> $1,000 = {Math.round(1000 * originalConfig.pointsPerPeso)} puntos</p>
                    <p>• <strong>Ahora:</strong> $1,000 = {Math.round(1000 * config.pointsPerPeso)} puntos</p>
                    <p>• <strong>Diferencia:</strong> {Math.round(1000 * config.pointsPerPeso) - Math.round(1000 * originalConfig.pointsPerPeso)} puntos</p>
                  </div>
                </div>
              )}
              
              <div className="mt-3 p-3 bg-white rounded border border-[#F15A25]">
                <p className="text-sm text-[#F15A25] font-medium">
                  💡 Define la relación entre pesos gastados y puntos otorgados
                </p>
              </div>
            </div>
          </div>

          {/* Configuración de Límite de Puntos */}
          <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#F15A25] mb-2">
                ⚠️ Límite de Puntos
              </h1>
              <p className="text-gray-700">
                Configura el límite para mostrar advertencias a los usuarios
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Límite Máximo de Puntos
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Define el límite máximo de puntos que puede acumular un usuario antes de mostrar una advertencia sutil. 
                  <strong className="text-[#F15A25]"> Configuración actual: {config.pointsLimit.toLocaleString("es-AR")} puntos</strong>
                </p>
                <div className="relative">
                  <Input
                    type="number"
                    value={config.pointsLimit}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        pointsLimit: parseInt(e.target.value) || 10000,
                      })
                    }
                    placeholder="10000"
                    min="1000"
                    step="1000"
                    className={originalConfig.pointsLimit !== config.pointsLimit ? "border-[#F59E0B] ring-2 ring-[#F59E0B] ring-opacity-20" : ""}
                  />
                  {originalConfig.pointsLimit !== config.pointsLimit && (
                    <div className="absolute -top-2 -right-2 bg-[#F59E0B] text-white text-xs px-2 py-1 rounded-full">
                      Cambió
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Actual: {config.pointsLimit.toLocaleString("es-AR")} puntos máximo
                  {originalConfig.pointsLimit !== config.pointsLimit && (
                    <span className="text-[#F59E0B] font-medium">
                      {" "}(antes: {originalConfig.pointsLimit.toLocaleString("es-AR")})
                    </span>
                  )}
                </p>
                <div className="mt-2 p-3 bg-[#F0F9FF] rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Advertencia:</strong> Cuando un usuario alcance el 50% del límite ({Math.round(config.pointsLimit * 0.5).toLocaleString("es-AR")} puntos), 
                    se le mostrará una notificación sutil sugiriendo que use sus puntos.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSave}
                    isLoading={saving}
                    className="flex-1 bg-[#F15A25] hover:bg-[#E55A1A] text-white"
                  >
                    Guardar Configuración
                  </Button>
                  
                  {originalConfig.pointsLimit !== config.pointsLimit && (
                    <Button
                      onClick={() => {
                        setConfig(originalConfig);
                        setMessage("Cambios revertidos");
                        setTimeout(() => setMessage(""), 3000);
                      }}
                      size="sm"
                      variant="outline"
                      className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#FEF3C7]"
                    >
                      ↩️ Revertir
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-8 p-4 bg-[#FCE6D5] rounded-lg">
              <h3 className="font-medium text-[#F15A25] mb-2">Vista Previa</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  • Límite de puntos: <span className="text-[#F15A25] font-semibold">{config.pointsLimit.toLocaleString("es-AR")} puntos</span>
                </p>
                <p>
                  • Advertencia al 50%: <span className="text-[#F59E0B] font-semibold">{Math.round(config.pointsLimit * 0.5).toLocaleString("es-AR")} puntos</span>
                </p>
                <p>
                  • Usuarios con advertencia: <span className="text-[#DC2626] font-semibold">≥ {Math.round(config.pointsLimit * 0.5).toLocaleString("es-AR")} puntos</span>
                </p>
              </div>
              
              <div className="mt-3 p-3 bg-white rounded border border-[#F15A25]">
                <p className="text-sm text-[#F15A25] font-medium">
                  💡 Controla cuándo mostrar advertencias para incentivar el uso de puntos
                </p>
              </div>
            </div>
          </div>

          {/* Limpieza del Sistema */}
          <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#F15A25] mb-2">
                🧹 Limpieza del Sistema
              </h1>
              <p className="text-gray-700">
                Gestiona la limpieza automática de premios vencidos y datos obsoletos
              </p>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-[#FCE6D5] rounded-lg border border-[#F15A25]/20">
                <h3 className="font-medium text-[#F15A25] mb-2">🗑️ Limpieza de Premios Vencidos</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Ejecuta la limpieza manual de premios que han caducado. Esta acción:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>• Marca como vencidos los premios PENDING que han expirado (24h)</li>
                  <li>• Elimina permanentemente los premios EXPIRED antiguos (48h adicionales)</li>
                  <li>• Libera espacio en la base de datos</li>
                </ul>
                
                <Button
                  onClick={handleCleanupRewards}
                  isLoading={cleaning}
                  disabled={cleaning}
                  className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white disabled:opacity-50"
                >
                  {cleaning ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Limpiando...
                    </div>
                  ) : (
                    "🧹 Ejecutar Limpieza de Premios"
                  )}
                </Button>
              </div>

              <div className="p-4 bg-[#F0F9FF] rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">ℹ️ Información del Sistema</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• La limpieza automática se ejecuta cada 6 horas</p>
                  <p>• Los premios vencen después de 24 horas sin reclamar</p>
                  <p>• Los premios vencidos se eliminan después de 48 horas adicionales</p>
                  <p>• Puedes ejecutar la limpieza manual en cualquier momento</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cambio de Contraseña */}
          <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#F15A25] mb-2">
                Cambiar Contraseña
              </h1>
              <p className="text-gray-700">
                Actualiza tu contraseña de administrador
              </p>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Contraseña de Administrador</h3>
              <Button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                size="sm"
                className={isChangingPassword ? "border-[#F15A25] text-[#F15A25] hover:bg-[#FCE6D5]" : "bg-[#F15A25] hover:bg-[#E55A1A] text-white"}
              >
                {isChangingPassword ? "Cancelar" : "Cambiar"}
              </Button>
            </div>

            {isChangingPassword && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      id="admin-current-password"
                      autoComplete="current-password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full pr-12"
                      style={{ fontSize: '16px', minHeight: '48px' }}
                      required
                      onFocus={(e) => {
                        // Fix específico para iOS Safari con inputs de contraseña
                        const input = e.target;
                        const val = input.value;
                        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                        
                        if (isIOS) {
                          // Fix más agresivo para iOS
                          input.blur();
                          setTimeout(() => {
                            input.focus();
                            input.value = '';
                            setTimeout(() => {
                              input.value = val;
                              input.setSelectionRange(val.length, val.length);
                            }, 10);
                          }, 10);
                        } else {
                          // Fix estándar para otros navegadores
                          input.value = '';
                          setTimeout(() => {
                            input.value = val;
                            input.setSelectionRange(val.length, val.length);
                          }, 0);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      style={{ minHeight: '20px', minWidth: '20px' }}
                    >
                      {showCurrentPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      id="admin-new-password"
                      autoComplete="new-password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full pr-12"
                      style={{ fontSize: '16px', minHeight: '48px' }}
                      required
                      minLength={6}
                      onFocus={(e) => {
                        // Fix específico para iOS Safari con inputs de contraseña
                        const input = e.target;
                        const val = input.value;
                        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                        
                        if (isIOS) {
                          // Fix más agresivo para iOS
                          input.blur();
                          setTimeout(() => {
                            input.focus();
                            input.value = '';
                            setTimeout(() => {
                              input.value = val;
                              input.setSelectionRange(val.length, val.length);
                            }, 10);
                          }, 10);
                        } else {
                          // Fix estándar para otros navegadores
                          input.value = '';
                          setTimeout(() => {
                            input.value = val;
                            input.setSelectionRange(val.length, val.length);
                          }, 0);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      style={{ minHeight: '20px', minWidth: '20px' }}
                    >
                      {showNewPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      id="admin-confirm-password"
                      autoComplete="new-password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full pr-12"
                      style={{ fontSize: '16px', minHeight: '48px' }}
                      required
                      minLength={6}
                      onFocus={(e) => {
                        // Fix específico para iOS Safari con inputs de contraseña
                        const input = e.target;
                        const val = input.value;
                        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                        
                        if (isIOS) {
                          // Fix más agresivo para iOS
                          input.blur();
                          setTimeout(() => {
                            input.focus();
                            input.value = '';
                            setTimeout(() => {
                              input.value = val;
                              input.setSelectionRange(val.length, val.length);
                            }, 10);
                          }, 10);
                        } else {
                          // Fix estándar para otros navegadores
                          input.value = '';
                          setTimeout(() => {
                            input.value = val;
                            input.setSelectionRange(val.length, val.length);
                          }, 0);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      style={{ minHeight: '20px', minWidth: '20px' }}
                    >
                      {showConfirmPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#F15A25] hover:bg-[#E55A1A] text-white"
                >
                  Cambiar Contraseña
                </Button>
              </form>
            )}

            <div className="mt-6 p-4 bg-[#FCE6D5] rounded-lg">
              <h3 className="font-medium text-[#F15A25] mb-2">🔐 Seguridad</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p>• Cambia tu contraseña regularmente</p>
                <p>• Usa una contraseña fuerte y única</p>
                <p>• No compartas tu contraseña con nadie</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de clave de seguridad */}
      <SecurityKeyModal
        isOpen={showSecurityKeyModal}
        onSuccess={handleSecurityKeySuccess}
        onClose={handleSecurityKeyClose}
      />
    </div>
  );
}
