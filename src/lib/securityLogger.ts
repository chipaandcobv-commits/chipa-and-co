import { NextRequest } from "next/server";

export enum SecurityEventType {
  // Autenticación
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  LOGOUT = "LOGOUT",
  REGISTER_SUCCESS = "REGISTER_SUCCESS",
  REGISTER_FAILED = "REGISTER_FAILED",
  
  // Autorización
  ACCESS_GRANTED = "ACCESS_GRANTED",
  ACCESS_DENIED = "ACCESS_DENIED",
  ADMIN_ACCESS = "ADMIN_ACCESS",
  
  // Ataques detectados
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  BRUTE_FORCE_ATTEMPT = "BRUTE_FORCE_ATTEMPT",
  SQL_INJECTION_ATTEMPT = "SQL_INJECTION_ATTEMPT",
  XSS_ATTEMPT = "XSS_ATTEMPT",
  CSRF_ATTEMPT = "CSRF_ATTEMPT",
  
  // Cambios de datos
  DATA_CREATED = "DATA_CREATED",
  DATA_UPDATED = "DATA_UPDATED",
  DATA_DELETED = "DATA_DELETED",
  
  // Errores de seguridad
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",
  SESSION_HIJACKING_ATTEMPT = "SESSION_HIJACKING_ATTEMPT",
}

export interface SecurityLogEntry {
  timestamp: string;
  eventType: SecurityEventType;
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

class SecurityLogger {
  private logs: SecurityLogEntry[] = [];
  private maxLogs = 10000; // Mantener solo los últimos 10k logs
  
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private getClientInfo(request: NextRequest) {
    return {
      ipAddress: request.headers.get("x-forwarded-for") || 
                 request.headers.get("x-real-ip") || 
                 request.headers.get("cf-connecting-ip") ||
                 "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      path: request.nextUrl.pathname,
      method: request.method,
    };
  }
  
  private determineRiskLevel(eventType: SecurityEventType, details: Record<string, any>): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    switch (eventType) {
      case SecurityEventType.LOGIN_SUCCESS:
      case SecurityEventType.LOGOUT:
      case SecurityEventType.ACCESS_GRANTED:
        return "LOW";
        
      case SecurityEventType.LOGIN_FAILED:
      case SecurityEventType.REGISTER_FAILED:
      case SecurityEventType.TOKEN_EXPIRED:
        return "MEDIUM";
        
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
      case SecurityEventType.ACCESS_DENIED:
      case SecurityEventType.TOKEN_INVALID:
        return "HIGH";
        
      case SecurityEventType.BRUTE_FORCE_ATTEMPT:
      case SecurityEventType.SQL_INJECTION_ATTEMPT:
      case SecurityEventType.XSS_ATTEMPT:
      case SecurityEventType.CSRF_ATTEMPT:
      case SecurityEventType.SESSION_HIJACKING_ATTEMPT:
        return "CRITICAL";
        
      default:
        return "MEDIUM";
    }
  }
  
  log(
    eventType: SecurityEventType,
    request: NextRequest,
    userId?: string,
    userEmail?: string,
    userRole?: string,
    details: Record<string, any> = {},
    sessionId?: string
  ): void {
    const clientInfo = this.getClientInfo(request);
    const requestId = this.generateRequestId();
    const riskLevel = this.determineRiskLevel(eventType, details);
    
    const logEntry: SecurityLogEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      userId,
      userEmail,
      userRole,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      path: clientInfo.path,
      method: clientInfo.method,
      details,
      riskLevel,
      sessionId,
      requestId,
    };
    // Agregar a logs
    this.logs.push(logEntry);
    
    // Limpiar logs antiguos si excede el límite
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // Log en consola para desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log(`🔒 [SECURITY] ${eventType}:`, {
        risk: riskLevel,
        user: userEmail || "anonymous",
        ip: clientInfo.ipAddress,
        path: clientInfo.path,
        details,
      });
    }
    
    // En producción, enviar a sistema de logging externo
    if (process.env.NODE_ENV === "production") {
      this.sendToExternalLogger(logEntry);
    }
  }
  
  private async sendToExternalLogger(logEntry: SecurityLogEntry): Promise<void> {
    try {
      // Aquí puedes integrar con servicios como:
      // - LogRocket
      // - Sentry
      // - Datadog
      // - AWS CloudWatch
      // - Google Cloud Logging
      
      if (process.env.SECURITY_WEBHOOK_URL) {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(logEntry),
        });
      }
    } catch (error) {
      console.error("Error sending security log to external service:", error);
    }
  }
  
  // Métodos de conveniencia para eventos comunes
  logLoginSuccess(request: NextRequest, userId: string, userEmail: string, userRole: string): void {
    this.log(SecurityEventType.LOGIN_SUCCESS, request, userId, userEmail, userRole, {
      loginTime: new Date().toISOString(),
    });
  }
  
  logLoginFailed(request: NextRequest, email: string, reason: string): void {
    this.log(SecurityEventType.LOGIN_FAILED, request, undefined, email, undefined, {
      reason,
      failedAttempts: 1, // Esto debería incrementarse por IP
    });
  }
  
  logAccessDenied(request: NextRequest, reason: string, userId?: string, userEmail?: string): void {
    this.log(SecurityEventType.ACCESS_DENIED, request, userId, userEmail, undefined, {
      reason,
      timestamp: new Date().toISOString(),
    });
  }
  
  logSuspiciousActivity(request: NextRequest, details: Record<string, any>): void {
    this.log(SecurityEventType.SUSPICIOUS_ACTIVITY, request, undefined, undefined, undefined, details);
  }
  
  logRateLimitExceeded(request: NextRequest, limit: number, windowMs: number): void {
    this.log(SecurityEventType.RATE_LIMIT_EXCEEDED, request, undefined, undefined, undefined, {
      limit,
      windowMs,
      exceededAt: new Date().toISOString(),
    });
  }
  
  // Obtener logs por criterios
  getLogsByRiskLevel(riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"): SecurityLogEntry[] {
    return this.logs.filter(log => log.riskLevel === riskLevel);
  }
  
  getLogsByEventType(eventType: SecurityEventType): SecurityLogEntry[] {
    return this.logs.filter(log => log.eventType === eventType);
  }
  
  getLogsByIP(ipAddress: string): SecurityLogEntry[] {
    return this.logs.filter(log => log.ipAddress === ipAddress);
  }
  
  getLogsByUser(userId: string): SecurityLogEntry[] {
    return this.logs.filter(log => log.userId === userId);
  }
  
  // Obtener estadísticas de seguridad
  getSecurityStats(): Record<string, any> {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const recentLogs = this.logs.filter(log => 
      new Date(log.timestamp).getTime() > oneHourAgo
    );
    
    const dailyLogs = this.logs.filter(log => 
      new Date(log.timestamp).getTime() > oneDayAgo
    );
    
    return {
      totalLogs: this.logs.length,
      logsLastHour: recentLogs.length,
      logsLastDay: dailyLogs.length,
      riskLevelDistribution: {
        LOW: this.logs.filter(log => log.riskLevel === "LOW").length,
        MEDIUM: this.logs.filter(log => log.riskLevel === "MEDIUM").length,
        HIGH: this.logs.filter(log => log.riskLevel === "HIGH").length,
        CRITICAL: this.logs.filter(log => log.riskLevel === "CRITICAL").length,
      },
      topEventTypes: this.getTopEventTypes(),
      topIPs: this.getTopIPs(),
    };
  }
  
  private getTopEventTypes(): Record<string, number> {
    const eventCounts: Record<string, number> = {};
    this.logs.forEach(log => {
      eventCounts[log.eventType] = (eventCounts[log.eventType] || 0) + 1;
    });
    
    return Object.fromEntries(
      Object.entries(eventCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
    );
  }
  
  private getTopIPs(): Record<string, number> {
    const ipCounts: Record<string, number> = {};
    this.logs.forEach(log => {
      ipCounts[log.ipAddress] = (ipCounts[log.ipAddress] || 0) + 1;
    });
    
    return Object.fromEntries(
      Object.entries(ipCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
    );
  }
  
  // Limpiar logs antiguos
  cleanupOldLogs(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAgeMs;
    this.logs = this.logs.filter(log => 
      new Date(log.timestamp).getTime() > cutoff
    );
  }
}

// Instancia singleton
export const securityLogger = new SecurityLogger();

// Limpiar logs antiguos cada día
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    securityLogger.cleanupOldLogs();
  }, 24 * 60 * 60 * 1000);
}

