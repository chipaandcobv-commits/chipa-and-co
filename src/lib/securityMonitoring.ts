// Sistema de monitoreo y alertas de seguridad
// Completamente GRATUITO - no requiere servicios externos

import { SecurityEventType } from './securityLogger';

interface SecurityAlert {
  id: string;
  timestamp: Date;
  type: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  event: SecurityEventType;
  message: string;
  details: any;
  ip?: string;
  userAgent?: string;
  resolved: boolean;
  resolvedAt?: Date;
}

interface SecurityMetrics {
  totalEvents: number;
  eventsLastHour: number;
  eventsLastDay: number;
  criticalEvents: number;
  highEvents: number;
  mediumEvents: number;
  lowEvents: number;
  topIPs: Array<{ ip: string; count: number }>;
  topEvents: Array<{ event: SecurityEventType; count: number }>;
  attackPatterns: Array<{ pattern: string; count: number; lastSeen: Date }>;
}

class SecurityMonitor {
  private alerts: SecurityAlert[] = [];
  private metrics: SecurityMetrics = {
    totalEvents: 0,
    eventsLastHour: 0,
    eventsLastDay: 0,
    criticalEvents: 0,
    highEvents: 0,
    mediumEvents: 0,
    lowEvents: 0,
    topIPs: [],
    topEvents: [],
    attackPatterns: [],
  };
  
  private thresholds = {
    maxEventsPerHour: 100,
    maxEventsPerDay: 1000,
    maxCriticalEventsPerHour: 10,
    maxHighEventsPerHour: 50,
    maxEventsPerIPPerHour: 20,
    maxEventsPerIPPerDay: 100,
  };

  // Procesar evento de seguridad
  processSecurityEvent(
    eventType: SecurityEventType,
    details: any,
    ip?: string,
    userAgent?: string
  ): void {
    const now = new Date();
    
    // Determinar nivel de alerta
    const alertLevel = this.determineAlertLevel(eventType, details);
    
    // Crear alerta si es necesario
    if (alertLevel === 'CRITICAL' || alertLevel === 'HIGH') {
      this.createAlert(eventType, alertLevel, details, ip, userAgent);
    }
    
    // Actualizar métricas
    this.updateMetrics(eventType, ip, details);
    
    // Verificar umbrales
    this.checkThresholds();
    
    // Log del evento
    this.logEvent(eventType, alertLevel, details, ip, userAgent);
  }

  private determineAlertLevel(eventType: SecurityEventType, details: any): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    switch (eventType) {
      case SecurityEventType.BRUTE_FORCE_ATTEMPT:
      case SecurityEventType.SQL_INJECTION_ATTEMPT:
      case SecurityEventType.XSS_ATTEMPT:
      case SecurityEventType.CSRF_ATTEMPT:
      case SecurityEventType.SESSION_HIJACKING_ATTEMPT:
        return 'CRITICAL';
        
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
      case SecurityEventType.ACCESS_DENIED:
      case SecurityEventType.TOKEN_INVALID:
        return 'HIGH';
        
      case SecurityEventType.LOGIN_FAILED:
      case SecurityEventType.REGISTER_FAILED:
      case SecurityEventType.TOKEN_EXPIRED:
        return 'MEDIUM';
        
      default:
        return 'LOW';
    }
  }

  private createAlert(
    eventType: SecurityEventType,
    level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    details: any,
    ip?: string,
    userAgent?: string
  ): void {
    const alert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: level,
      event: eventType,
      message: this.generateAlertMessage(eventType, details),
      details,
      ip,
      userAgent,
      resolved: false,
    };
    
    this.alerts.push(alert);
    
    // Mantener solo las últimas 1000 alertas
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }
    
    // Enviar notificación si es crítica
    if (level === 'CRITICAL') {
      this.sendCriticalAlert(alert);
    }
  }

  private generateAlertMessage(eventType: SecurityEventType, details: any): string {
    switch (eventType) {
      case SecurityEventType.BRUTE_FORCE_ATTEMPT:
        return `Intento de fuerza bruta detectado: ${details.reason || 'Múltiples intentos de login fallidos'}`;
        
      case SecurityEventType.SQL_INJECTION_ATTEMPT:
        return `Intento de inyección SQL detectado: ${details.pattern || 'Patrón sospechoso'}`;
        
      case SecurityEventType.XSS_ATTEMPT:
        return `Intento de XSS detectado: ${details.pattern || 'Script malicioso'}`;
        
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        return `Límite de velocidad excedido: ${details.totalRequests || 0} requests`;
        
      case SecurityEventType.ACCESS_DENIED:
        return `Acceso denegado: ${details.reason || 'Sin autorización'}`;
        
      default:
        return `Evento de seguridad: ${eventType}`;
    }
  }

  private updateMetrics(eventType: SecurityEventType, ip?: string, details?: any): void {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    this.metrics.totalEvents++;
    
    // Actualizar contadores por nivel
    const level = this.determineAlertLevel(eventType, details);
    switch (level) {
      case 'CRITICAL':
        this.metrics.criticalEvents++;
        break;
      case 'HIGH':
        this.metrics.highEvents++;
        break;
      case 'MEDIUM':
        this.metrics.mediumEvents++;
        break;
      case 'LOW':
        this.metrics.lowEvents++;
        break;
    }
    
    // Actualizar contadores por IP
    if (ip) {
      const ipEntry = this.metrics.topIPs.find(entry => entry.ip === ip);
      if (ipEntry) {
        ipEntry.count++;
      } else {
        this.metrics.topIPs.push({ ip, count: 1 });
      }
      
      // Mantener solo las top 20 IPs
      this.metrics.topIPs = this.metrics.topIPs
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    }
    
    // Actualizar contadores por evento
    const eventEntry = this.metrics.topEvents.find(entry => entry.event === eventType);
    if (eventEntry) {
      eventEntry.count++;
    } else {
      this.metrics.topEvents.push({ event: eventType, count: 1 });
    }
    
    // Mantener solo los top 20 eventos
    this.metrics.topEvents = this.metrics.topEvents
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  private checkThresholds(): void {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    // Contar eventos de la última hora
    const recentEvents = this.alerts.filter(alert => 
      alert.timestamp.getTime() > oneHourAgo
    );
    
    const recentCriticalEvents = recentEvents.filter(alert => alert.type === 'CRITICAL');
    const recentHighEvents = recentEvents.filter(alert => alert.type === 'HIGH');
    
    // Verificar umbrales
    if (recentEvents.length > this.thresholds.maxEventsPerHour) {
      this.createThresholdAlert('TOO_MANY_EVENTS_PER_HOUR', {
        count: recentEvents.length,
        threshold: this.thresholds.maxEventsPerHour,
      });
    }
    
    if (recentCriticalEvents.length > this.thresholds.maxCriticalEventsPerHour) {
      this.createThresholdAlert('TOO_MANY_CRITICAL_EVENTS', {
        count: recentCriticalEvents.length,
        threshold: this.thresholds.maxCriticalEventsPerHour,
      });
    }
    
    if (recentHighEvents.length > this.thresholds.maxHighEventsPerHour) {
      this.createThresholdAlert('TOO_MANY_HIGH_EVENTS', {
        count: recentHighEvents.length,
        threshold: this.thresholds.maxHighEventsPerHour,
      });
    }
  }

  private createThresholdAlert(type: string, details: any): void {
    const alert: SecurityAlert = {
      id: `threshold_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'CRITICAL',
      event: SecurityEventType.SUSPICIOUS_ACTIVITY,
      message: `Umbral de seguridad excedido: ${type}`,
      details,
      resolved: false,
    };
    
    this.alerts.push(alert);
    this.sendCriticalAlert(alert);
  }

  private sendCriticalAlert(alert: SecurityAlert): void {
    // En desarrollo, solo log en consola
    console.log('🚨 [SECURITY ALERT]', {
      id: alert.id,
      type: alert.type,
      event: alert.event,
      message: alert.message,
      timestamp: alert.timestamp.toISOString(),
      ip: alert.ip,
      details: alert.details,
    });
    
    // En producción, enviar a webhook si está configurado
    if (process.env.SECURITY_WEBHOOK_URL) {
      this.sendWebhookAlert(alert);
    }
  }

  private async sendWebhookAlert(alert: SecurityAlert): Promise<void> {
    try {
      await fetch(process.env.SECURITY_WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alert,
          metrics: this.getMetrics(),
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error sending webhook alert:', error);
    }
  }

  private logEvent(
    eventType: SecurityEventType,
    level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    details: any,
    ip?: string,
    userAgent?: string
  ): void {
    const timestamp = new Date().toISOString();
    const logLevel = level === 'CRITICAL' ? '🚨' : level === 'HIGH' ? '⚠️' : level === 'MEDIUM' ? 'ℹ️' : '📝';
    
    console.log(`${logLevel} [SECURITY MONITOR] ${eventType}:`, {
      timestamp,
      level,
      ip,
      userAgent: userAgent?.substring(0, 100),
      details,
    });
  }

  // Métodos públicos
  getAlerts(limit: number = 100): SecurityAlert[] {
    return this.alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getUnresolvedAlerts(): SecurityAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  getCriticalAlerts(): SecurityAlert[] {
    return this.alerts.filter(alert => alert.type === 'CRITICAL' && !alert.resolved);
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  getMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  getHealthStatus(): {
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    issues: string[];
    metrics: SecurityMetrics;
  } {
    const issues: string[] = [];
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const recentAlerts = this.alerts.filter(alert => 
      alert.timestamp.getTime() > oneHourAgo
    );
    
    const recentCriticalAlerts = recentAlerts.filter(alert => alert.type === 'CRITICAL');
    const recentHighAlerts = recentAlerts.filter(alert => alert.type === 'HIGH');
    
    if (recentCriticalAlerts.length > 5) {
      issues.push(`Demasiadas alertas críticas: ${recentCriticalAlerts.length}`);
    }
    
    if (recentHighAlerts.length > 20) {
      issues.push(`Demasiadas alertas de alta prioridad: ${recentHighAlerts.length}`);
    }
    
    if (recentAlerts.length > 100) {
      issues.push(`Demasiados eventos de seguridad: ${recentAlerts.length}`);
    }
    
    let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
    
    if (issues.length > 0) {
      status = issues.some(issue => issue.includes('críticas')) ? 'CRITICAL' : 'WARNING';
    }
    
    return {
      status,
      issues,
      metrics: this.getMetrics(),
    };
  }

  // Limpiar alertas antiguas
  cleanupOldAlerts(maxAgeDays: number = 30): void {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxAgeDays);
    
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
  }
}

// Instancia singleton
export const securityMonitor = new SecurityMonitor();

// Limpiar alertas antiguas cada día
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    securityMonitor.cleanupOldAlerts();
  }, 24 * 60 * 60 * 1000);
}

// Función de conveniencia para procesar eventos
export function processSecurityEvent(
  eventType: SecurityEventType,
  details: any,
  ip?: string,
  userAgent?: string
): void {
  securityMonitor.processSecurityEvent(eventType, details, ip, userAgent);
}

// Función para obtener estado de salud
export function getSecurityHealth() {
  return securityMonitor.getHealthStatus();
}

// Función para obtener alertas
export function getSecurityAlerts(limit?: number) {
  return securityMonitor.getAlerts(limit);
}
