"use client";
import { useState, useEffect } from "react";
import { Card } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { DashboardIcon, ShieldIcon, AlertIcon, CheckIcon } from "../../../components/icons/Icons";

interface SecurityStats {
  totalLogs: number;
  logsLastHour: number;
  logsLastDay: number;
  riskLevelDistribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  topEventTypes: Record<string, number>;
  topIPs: Record<string, number>;
}

interface SecurityLog {
  timestamp: string;
  eventType: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress: string;
  userAgent: string;
  path: string;
  method: string;
  details: Record<string, any>;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sessionId?: string;
  requestId: string;
}

export default function SecurityDashboard() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("ALL");

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // En una implementación real, estas serían llamadas a la API
      // Por ahora, simulamos datos
      const mockStats: SecurityStats = {
        totalLogs: 1247,
        logsLastHour: 23,
        logsLastDay: 156,
        riskLevelDistribution: {
          LOW: 890,
          MEDIUM: 234,
          HIGH: 98,
          CRITICAL: 25,
        },
        topEventTypes: {
          "LOGIN_SUCCESS": 156,
          "ACCESS_GRANTED": 234,
          "LOGIN_FAILED": 45,
          "RATE_LIMIT_EXCEEDED": 12,
          "SUSPICIOUS_ACTIVITY": 8,
        },
        topIPs: {
          "192.168.1.100": 89,
          "10.0.0.50": 67,
          "172.16.0.25": 45,
          "203.0.113.10": 23,
          "198.51.100.5": 18,
        },
      };

      const mockLogs: SecurityLog[] = [
        {
          timestamp: new Date().toISOString(),
          eventType: "RATE_LIMIT_EXCEEDED",
          ipAddress: "203.0.113.10",
          userAgent: "curl/7.68.0",
          path: "/api/auth/login",
          method: "POST",
          details: { limit: 5, windowMs: 900000 },
          riskLevel: "HIGH",
          requestId: "req_1234567890_abc123",
        },
        {
          timestamp: new Date(Date.now() - 300000).toISOString(),
          eventType: "SUSPICIOUS_ACTIVITY",
          ipAddress: "198.51.100.5",
          userAgent: "sqlmap/1.6.12",
          path: "/api/admin/users",
          method: "GET",
          details: { reason: "Suspicious User-Agent", userAgent: "sqlmap/1.6.12" },
          riskLevel: "CRITICAL",
          requestId: "req_1234567890_def456",
        },
        {
          timestamp: new Date(Date.now() - 600000).toISOString(),
          eventType: "LOGIN_FAILED",
          ipAddress: "192.168.1.100",
          userEmail: "admin@example.com",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          path: "/api/auth/login",
          method: "POST",
          details: { reason: "Invalid password", failedAttempts: 3 },
          riskLevel: "MEDIUM",
          requestId: "req_1234567890_ghi789",
        },
      ];

      setStats(mockStats);
      setRecentLogs(mockLogs);
    } catch (error) {
      console.error("Error fetching security data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "LOW":
        return "text-green-600 bg-green-100";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100";
      case "HIGH":
        return "text-orange-600 bg-orange-100";
      case "CRITICAL":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "LOW":
        return <CheckIcon className="h-4 w-4" />;
      case "MEDIUM":
        return <AlertIcon className="h-4 w-4" />;
      case "HIGH":
        return <AlertIcon className="h-4 w-4" />;
      case "CRITICAL":
        return <AlertIcon className="h-4 w-4 text-red-600" />;
      default:
        return <AlertIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F7EFE7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26D1F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard de seguridad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="pt-4 mb-8">
          <div className="ml-4 rounded-l-full rounded-r-none bg-[#FCE6D5] py-3 pr-2 pl-4 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <ShieldIcon className="h-6 w-6" />
            </div>
            <div className="leading-tight">
              <p className="text-[14px] font-medium text-neutral-800">
                Dashboard de Seguridad
              </p>
              <p className="text-[12px] text-neutral-600">
                Monitoreo y análisis de eventos de seguridad
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Logs</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalLogs.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DashboardIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Hora</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.logsLastHour}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Último Día</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.logsLastDay}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Amenazas Críticas</p>
                <p className="text-2xl font-bold text-red-600">{stats?.riskLevelDistribution.CRITICAL}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Distribución de Niveles de Riesgo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Riesgo</h3>
            <div className="space-y-4">
              {Object.entries(stats?.riskLevelDistribution || {}).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(level)}`}>
                      {level}
                    </span>
                    <span className="text-sm text-gray-600">{level === "LOW" ? "Bajo" : level === "MEDIUM" ? "Medio" : level === "HIGH" ? "Alto" : "Crítico"}</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Eventos Principales</h3>
            <div className="space-y-3">
              {Object.entries(stats?.topEventTypes || {})
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([eventType, count]) => (
                  <div key={eventType} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {eventType === "LOGIN_SUCCESS" ? "Login Exitoso" :
                       eventType === "ACCESS_GRANTED" ? "Acceso Concedido" :
                       eventType === "LOGIN_FAILED" ? "Login Fallido" :
                       eventType === "RATE_LIMIT_EXCEEDED" ? "Límite de Velocidad Excedido" :
                       eventType === "SUSPICIOUS_ACTIVITY" ? "Actividad Sospechosa" : eventType}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {/* IPs Principales */}
        <Card className="bg-white p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">IPs con Más Actividad</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats?.topIPs || {})
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([ip, count]) => (
                <div key={ip} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-mono text-gray-700">{ip}</span>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </Card>

        {/* Logs Recientes */}
        <Card className="bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Logs de Seguridad Recientes</h3>
            <div className="flex gap-2">
              <Button
                variant={selectedRiskLevel === "ALL" ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedRiskLevel("ALL")}
              >
                Todos
              </Button>
              <Button
                variant={selectedRiskLevel === "CRITICAL" ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedRiskLevel("CRITICAL")}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Críticos
              </Button>
              <Button
                variant={selectedRiskLevel === "HIGH" ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedRiskLevel("HIGH")}
                className="text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                Altos
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {recentLogs
              .filter(log => selectedRiskLevel === "ALL" || log.riskLevel === selectedRiskLevel)
              .map((log, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getRiskLevelIcon(log.riskLevel)}
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(log.riskLevel)}`}>
                          {log.riskLevel}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {log.eventType === "RATE_LIMIT_EXCEEDED" ? "Límite de Velocidad Excedido" :
                           log.eventType === "SUSPICIOUS_ACTIVITY" ? "Actividad Sospechosa" :
                           log.eventType === "LOGIN_FAILED" ? "Login Fallido" : log.eventType}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">IP:</span>
                          <span className="ml-2 font-mono text-gray-900">{log.ipAddress}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Ruta:</span>
                          <span className="ml-2 text-gray-900">{log.path}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Método:</span>
                          <span className="ml-2 text-gray-900">{log.method}</span>
                        </div>
                      </div>
                      
                      {log.userEmail && (
                        <div className="mt-2">
                          <span className="font-medium text-gray-600">Usuario:</span>
                          <span className="ml-2 text-gray-900">{log.userEmail}</span>
                        </div>
                      )}
                      
                      {Object.keys(log.details).length > 0 && (
                        <div className="mt-2">
                          <span className="font-medium text-gray-600">Detalles:</span>
                          <div className="ml-2 mt-1 text-sm text-gray-700 bg-gray-100 p-2 rounded">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right text-sm text-gray-500">
                      <div>{new Date(log.timestamp).toLocaleDateString("es-ES")}</div>
                      <div>{new Date(log.timestamp).toLocaleTimeString("es-ES")}</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Acciones de Seguridad */}
        <div className="mt-8 flex gap-4">
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <ShieldIcon className="h-4 w-4 mr-2" />
            Bloquear IP Sospechosa
          </Button>
          
          <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
            <AlertIcon className="h-4 w-4 mr-2" />
            Generar Reporte
          </Button>
          
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <DashboardIcon className="h-4 w-4 mr-2" />
            Configurar Alertas
          </Button>
        </div>
      </main>
    </div>
  );
}

