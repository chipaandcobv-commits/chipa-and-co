import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-config";
import { getSecurityHealth, getSecurityAlerts } from "../../../../lib/securityMonitoring";
import { securityLogger, SecurityEventType } from "../../../../lib/securityLogger";

// GET - Obtener estado de seguridad
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar que sea admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Se requieren permisos de administrador" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "health";
    const limit = parseInt(searchParams.get("limit") || "100");

    let data: any = {};

    switch (type) {
      case "health":
        data = getSecurityHealth();
        break;
        
      case "alerts":
        data = {
          alerts: getSecurityAlerts(limit),
          total: getSecurityAlerts().length,
        };
        break;
        
      case "metrics":
        const health = getSecurityHealth();
        data = health.metrics;
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: "Tipo de consulta no válido" },
          { status: 400 }
        );
    }

    // Log del acceso a información de seguridad
    securityLogger.log(
      SecurityEventType.ADMIN_ACCESS,
      request,
      session.user.id,
      session.user.email,
      session.user.role,
      {
        action: "security_monitoring_access",
        type,
        limit,
      }
    );

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Security monitoring error:", error);
    
    securityLogger.log(
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      request,
      undefined,
      undefined,
      undefined,
      {
        reason: "Security monitoring error",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    );

    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Resolver alerta de seguridad
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar que sea admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Se requieren permisos de administrador" },
        { status: 403 }
      );
    }

    const { alertId, action } = await request.json();

    if (!alertId || !action) {
      return NextResponse.json(
        { success: false, error: "ID de alerta y acción requeridos" },
        { status: 400 }
      );
    }

    let result = false;

    switch (action) {
      case "resolve":
        // Importar la función de resolución
        const { securityMonitor } = await import("../../../../lib/securityMonitoring");
        result = securityMonitor.resolveAlert(alertId);
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: "Acción no válida" },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Alerta no encontrada" },
        { status: 404 }
      );
    }

    // Log de la acción administrativa
    securityLogger.log(
      SecurityEventType.ADMIN_ACCESS,
      request,
      session.user.id,
      session.user.email,
      session.user.role,
      {
        action: "security_alert_resolved",
        alertId,
        resolvedBy: session.user.email,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Alerta resuelta exitosamente",
    });
  } catch (error) {
    console.error("Security alert resolution error:", error);
    
    securityLogger.log(
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      request,
      undefined,
      undefined,
      undefined,
      {
        reason: "Security alert resolution error",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    );

    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
