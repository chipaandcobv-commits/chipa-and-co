// Sistema avanzado de rate limiting con soporte para memoria y Redis
// Gratis en desarrollo, gratis en producción con Upstash

import { NextRequest } from "next/server";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDuration: number;
  keyGenerator?: (request: NextRequest) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil: number;
  firstRequest: number;
  lastRequest: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  blockedUntil?: number;
  totalRequests: number;
  windowStart: number;
}

// Configuración por ruta con límites más estrictos
const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Registro - muy restrictivo
  "/api/auth/register": {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 3, // 3 intentos por hora
    blockDuration: 2 * 60 * 60 * 1000, // Bloqueo por 2 horas
  },
  // Login - restrictivo
  "/api/auth/login": {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // 5 intentos por 15 minutos
    blockDuration: 30 * 60 * 1000, // Bloqueo por 30 minutos
  },
  // APIs admin - moderadamente restrictivo
  "/api/admin": {
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 100, // 100 requests por 5 minutos
    blockDuration: 15 * 60 * 1000, // Bloqueo por 15 minutos
  },
  // APIs generales - menos restrictivo
  default: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 60, // 60 requests por minuto
    blockDuration: 5 * 60 * 1000, // Bloqueo por 5 minutos
  },
};

// Límites globales
const GLOBAL_LIMITS = {
  maxRegistrationsPerDay: parseInt(process.env.MAX_REGISTRATIONS_PER_DAY || '50'),
  maxRegistrationsPerIPPerDay: parseInt(process.env.MAX_REGISTRATIONS_PER_IP_PER_DAY || '10'),
  maxLoginAttemptsPerIPPerHour: parseInt(process.env.MAX_LOGIN_ATTEMPTS_PER_IP_PER_HOUR || '10'),
};

// Store en memoria (fallback)
const memoryStore: Record<string, RateLimitEntry> = {};

// Clase para manejo de rate limiting
class RateLimitManager {
  private provider: 'memory' | 'redis';
  private redisClient?: any;

  constructor() {
    this.provider = (process.env.RATE_LIMIT_PROVIDER as 'memory' | 'redis') || 'memory';
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (this.provider === 'redis') {
      try {
        // Configuración para Upstash Redis (gratis)
        const { Redis } = await import('@upstash/redis');
        this.redisClient = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL!,
          token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
        console.log('✅ [RATE_LIMIT] Redis conectado (Upstash)');
      } catch (error) {
        console.warn('⚠️ [RATE_LIMIT] Redis no disponible, usando memoria:', error);
        this.provider = 'memory';
      }
    }
  }

  private generateKey(request: NextRequest, path: string): string {
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "unknown";
    
    // Crear clave más específica
    const baseKey = `${path}:${ip}`;
    const userAgentHash = this.hashString(userAgent);
    
    return `${baseKey}:${userAgentHash}`;
  }

  private getClientIP(request: NextRequest): string {
    return request.headers.get("x-forwarded-for") || 
           request.headers.get("x-real-ip") || 
           request.headers.get("cf-connecting-ip") || 
           request.headers.get("x-client-ip") || 
           "unknown";
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private async getEntry(key: string): Promise<RateLimitEntry | null> {
    if (this.provider === 'redis' && this.redisClient) {
      try {
        const data = await this.redisClient.get(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('Redis get error:', error);
        return null;
      }
    } else {
      return memoryStore[key] || null;
    }
  }

  private async setEntry(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void> {
    if (this.provider === 'redis' && this.redisClient) {
      try {
        await this.redisClient.setex(key, Math.ceil(ttlMs / 1000), JSON.stringify(entry));
      } catch (error) {
        console.error('Redis set error:', error);
        // Fallback a memoria
        memoryStore[key] = entry;
      }
    } else {
      memoryStore[key] = entry;
    }
  }

  private async deleteEntry(key: string): Promise<void> {
    if (this.provider === 'redis' && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (error) {
        console.error('Redis delete error:', error);
      }
    } else {
      delete memoryStore[key];
    }
  }

  async checkRateLimit(request: NextRequest, path: string): Promise<RateLimitResult> {
    const config = this.getConfigForPath(path);
    const key = this.generateKey(request, path);
    const now = Date.now();
    
    // Obtener entrada actual
    let entry = await this.getEntry(key);
    
    // Limpiar entrada si expiró
    if (entry && now > entry.resetTime && (!entry.blockedUntil || now > entry.blockedUntil)) {
      await this.deleteEntry(key);
      entry = null;
    }
    
    // Si está bloqueado
    if (entry && entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        blockedUntil: entry.blockedUntil,
        totalRequests: entry.count,
        windowStart: entry.firstRequest,
      };
    }
    
    // Crear nueva entrada si no existe
    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        blockedUntil: 0,
        firstRequest: now,
        lastRequest: now,
      };
    }
    
    // Verificar límite
    if (entry.count >= config.maxRequests) {
      entry.blockedUntil = now + config.blockDuration;
      await this.setEntry(key, entry, config.blockDuration);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        blockedUntil: entry.blockedUntil,
        totalRequests: entry.count,
        windowStart: entry.firstRequest,
      };
    }
    
    // Incrementar contador
    entry.count++;
    entry.lastRequest = now;
    
    const ttl = Math.max(entry.resetTime - now, config.blockDuration);
    await this.setEntry(key, entry, ttl);
    
    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      totalRequests: entry.count,
      windowStart: entry.firstRequest,
    };
  }

  private getConfigForPath(path: string): RateLimitConfig {
    for (const [route, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
      if (route !== "default" && path.startsWith(route)) {
        return config;
      }
    }
    return RATE_LIMIT_CONFIGS.default;
  }

  // Verificar límites globales
  async checkGlobalLimits(request: NextRequest, action: 'register' | 'login'): Promise<{ allowed: boolean; reason?: string }> {
    const ip = this.getClientIP(request);
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneHourMs = 60 * 60 * 1000;

    if (action === 'register') {
      // Verificar límite global de registros por día
      const globalKey = `global:registrations:${Math.floor(now / oneDayMs)}`;
      const globalEntry = await this.getEntry(globalKey);
      
      if (globalEntry && globalEntry.count >= GLOBAL_LIMITS.maxRegistrationsPerDay) {
        return {
          allowed: false,
          reason: `Límite global de registros alcanzado (${GLOBAL_LIMITS.maxRegistrationsPerDay}/día)`
        };
      }

      // Verificar límite por IP
      const ipKey = `ip:registrations:${ip}:${Math.floor(now / oneDayMs)}`;
      const ipEntry = await this.getEntry(ipKey);
      
      if (ipEntry && ipEntry.count >= GLOBAL_LIMITS.maxRegistrationsPerIPPerDay) {
        return {
          allowed: false,
          reason: `Límite de registros por IP alcanzado (${GLOBAL_LIMITS.maxRegistrationsPerIPPerDay}/día)`
        };
      }
    }

    if (action === 'login') {
      // Verificar límite de intentos de login por IP
      const loginKey = `ip:logins:${ip}:${Math.floor(now / oneHourMs)}`;
      const loginEntry = await this.getEntry(loginKey);
      
      if (loginEntry && loginEntry.count >= GLOBAL_LIMITS.maxLoginAttemptsPerIPPerHour) {
        return {
          allowed: false,
          reason: `Límite de intentos de login alcanzado (${GLOBAL_LIMITS.maxLoginAttemptsPerIPPerHour}/hora)`
        };
      }
    }

    return { allowed: true };
  }

  // Incrementar contadores globales
  async incrementGlobalCounter(request: NextRequest, action: 'register' | 'login'): Promise<void> {
    const ip = this.getClientIP(request);
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneHourMs = 60 * 60 * 1000;

    if (action === 'register') {
      // Incrementar contador global
      const globalKey = `global:registrations:${Math.floor(now / oneDayMs)}`;
      const globalEntry = await this.getEntry(globalKey) || { count: 0, resetTime: now + oneDayMs, blockedUntil: 0, firstRequest: now, lastRequest: now };
      globalEntry.count++;
      globalEntry.lastRequest = now;
      await this.setEntry(globalKey, globalEntry, oneDayMs);

      // Incrementar contador por IP
      const ipKey = `ip:registrations:${ip}:${Math.floor(now / oneDayMs)}`;
      const ipEntry = await this.getEntry(ipKey) || { count: 0, resetTime: now + oneDayMs, blockedUntil: 0, firstRequest: now, lastRequest: now };
      ipEntry.count++;
      ipEntry.lastRequest = now;
      await this.setEntry(ipKey, ipEntry, oneDayMs);
    }

    if (action === 'login') {
      // Incrementar contador de login por IP
      const loginKey = `ip:logins:${ip}:${Math.floor(now / oneHourMs)}`;
      const loginEntry = await this.getEntry(loginKey) || { count: 0, resetTime: now + oneHourMs, blockedUntil: 0, firstRequest: now, lastRequest: now };
      loginEntry.count++;
      loginEntry.lastRequest = now;
      await this.setEntry(loginKey, loginEntry, oneHourMs);
    }
  }

  // Limpiar entradas expiradas (ejecutar periódicamente)
  async cleanup(): Promise<void> {
    if (this.provider === 'memory') {
      const now = Date.now();
      for (const [key, entry] of Object.entries(memoryStore)) {
        if (now > entry.resetTime && (!entry.blockedUntil || now > entry.blockedUntil)) {
          delete memoryStore[key];
        }
      }
    }
    // Redis maneja la expiración automáticamente
  }
}

// Instancia singleton
const rateLimitManager = new RateLimitManager();

// Limpiar memoria cada hora
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    rateLimitManager.cleanup();
  }, 60 * 60 * 1000);
}

// Funciones de exportación
export async function checkAdvancedRateLimit(
  request: NextRequest,
  path: string
): Promise<RateLimitResult> {
  return await rateLimitManager.checkRateLimit(request, path);
}

export async function checkGlobalRateLimit(
  request: NextRequest,
  action: 'register' | 'login'
): Promise<{ allowed: boolean; reason?: string }> {
  return await rateLimitManager.checkGlobalLimits(request, action);
}

export async function incrementGlobalCounter(
  request: NextRequest,
  action: 'register' | 'login'
): Promise<void> {
  return await rateLimitManager.incrementGlobalCounter(request, action);
}

export function getRateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  return {
    "X-RateLimit-Limit": "100",
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
    "X-RateLimit-Total": result.totalRequests.toString(),
    "Retry-After": result.blockedUntil 
      ? Math.ceil((result.blockedUntil - Date.now()) / 1000).toString()
      : "0",
  };
}
